import { SandboxConfig } from "../types";
import {
  generatePanelSeries,
  computeDIDEstimator,
  computeEventStudyCoefficients,
  generatePlaceboDistribution,
} from "./econometrics";

export interface CodeExecutionResult {
  stdout: string;
  charts: {
    title: string;
    description: string;
    type: "event-study" | "parallel-trends" | "placebo-dist";
    data: any;
  }[];
  summary: {
    treatmentEffect: number;
    standardError: number;
    tStatistic: number;
    pValue: number;
    rSquared: number;
    clusters: number;
    observations: number;
    fStatisticPreTrend: number;
    preTrendPassed: boolean;
    placeboPValue: number;
  };
  executionTimeMs: number;
  timestamp: string;
}

export function executeEconometricCode(
  lang: "python" | "stata" | "r",
  config: SandboxConfig
): CodeExecutionResult {
  const startTime = performance.now();
  const panel = generatePanelSeries(config);
  const did = computeDIDEstimator(panel);
  const eventStudy = computeEventStudyCoefficients(config);
  const placebo = generatePlaceboDistribution(did.didEstimate, 500);

  const nUnits = 100;
  const nObs = nUnits * config.totalPeriods;
  const se = Number((0.24 + config.noiseLevel * 0.18).toFixed(4));
  const tStat = Number((did.didEstimate / se).toFixed(4));
  const pVal = Number((2 * (1 - Math.min(0.9999, Math.abs(tStat) > 3.8 ? 0.9999 : 0.5 + 0.499 * (1 - Math.exp(-0.7 * Math.abs(tStat)))))).toFixed(5));
  const r2 = Number((0.78 - config.noiseLevel * 0.08).toFixed(4));

  let stdout = "";

  if (lang === "python") {
    stdout = `======================================================================
[Model 1] Classical Difference-in-Differences (DID) Regression
Dependent Variable: outcome | Covariance Type: cluster (unit_id)
Sample: ${nUnits} Units, ${config.totalPeriods} Periods | No. Observations: ${nObs}
======================================================================
                 coef    std err          z      P>|z|      [0.025      0.975]
----------------------------------------------------------------------
Intercept      ${config.interceptControl.toFixed(4)}     0.1182     ${(config.interceptControl / 0.1182).toFixed(3)}      0.0000      ${(config.interceptControl - 0.23).toFixed(3)}      ${(config.interceptControl + 0.23).toFixed(3)}
treat          ${config.interceptTreatedDiff.toFixed(4)}     0.1654     ${(config.interceptTreatedDiff / 0.1654).toFixed(3)}      0.0000      ${(config.interceptTreatedDiff - 0.32).toFixed(3)}      ${(config.interceptTreatedDiff + 0.32).toFixed(3)}
post           ${(config.baseSlope * (config.totalPeriods - (config.shockPeriod - config.startYear))).toFixed(4)}     0.0912     ${((config.baseSlope * 4) / 0.0912).toFixed(3)}      0.0000       ${(config.baseSlope * 4 - 0.18).toFixed(3)}       ${(config.baseSlope * 4 + 0.18).toFixed(3)}
treat:post     ${did.didEstimate.toFixed(4)}     ${se.toFixed(4)}     ${tStat.toFixed(3)}      ${pVal.toFixed(4)}      ${(did.didEstimate - 1.96 * se).toFixed(3)}      ${(did.didEstimate + 1.96 * se).toFixed(3)}
======================================================================
Estimated Causal Treatment Effect (delta_hat): ${did.didEstimate.toFixed(4)} (SE: ${se.toFixed(4)}, p-value: ${pVal.toFixed(4)})

======================================================================
[Model 2] Two-Way Fixed Effects (TWFE) with Unit & Time Fixed Effects
======================================================================
TWFE did Coefficient: ${did.didEstimate.toFixed(4)}, Clustered SE: ${(se * 0.96).toFixed(4)}
Absorbed Fixed Effects: 100 unit_id categories, ${config.totalPeriods} year categories
Within R-squared: ${r2} | F-statistic: ${(tStat * tStat).toFixed(2)}

======================================================================
[Model 3] Dynamic Event Study Specification (Reference Period: k = -1)
======================================================================
 k      coef      se    ci_lower    ci_upper
${eventStudy.coefficients
  .map(
    (c) =>
      `${c.k >= 0 ? " " : ""}${c.k.toString().padEnd(3)}   ${c.coef
        .toFixed(4)
        .padStart(8)}  ${c.se.toFixed(4).padStart(7)}  ${c.ciLower
        .toFixed(4)
        .padStart(10)}  ${c.ciUpper.toFixed(4).padStart(10)}`
  )
  .join("\n")}

Joint Wald Test for Pre-treatment Trends (H0: beta_pre = 0):
F-statistic = ${config.violatePreTrend ? "8.42" : "0.76"}, p-value = ${eventStudy.preTrendPValue.toFixed(4)}
Pre-trend Test Status: ${eventStudy.passedPreTrend ? "PASSED (Parallel trends hold)" : "REJECTED (Pre-trend violation detected)"}

======================================================================
[5] Visualizations Rendered
======================================================================
Figure 1: Parallel Trends & Counterfactual Trajectories
Figure 2: Event Study Dynamic Coefficients (95% CI)
Figure 3: Monte Carlo In-Space Placebo Permutation Distribution (N = 500)
All plots rendered successfully with English annotations.`;
  } else if (lang === "stata") {
    stdout = `. * Stata 18.0 Output - Econometric Estimation
. reghdfe outcome treat_x_post, absorb(unit_id year) vce(cluster unit_id)
(converged in 3 iterations)

HDFE Linear regression                            Number of obs   =     ${nObs}
Absorbing 2 HDFE groups                           F(   1,     99) =     ${(tStat * tStat).toFixed(2)}
                                                  Prob > F        =     ${pVal < 0.001 ? "0.0000" : pVal.toFixed(4)}
                                                  R-squared       =     ${r2}
                                                  Adj R-squared   =     ${(r2 - 0.03).toFixed(4)}
                                                  Root MSE        =     0.4821
(Std. err. adjusted for 100 clusters in unit_id)
------------------------------------------------------------------------------
             |               Robust
     outcome | Coefficient  std. err.      t    P>|t|     [95% conf. interval]
-------------+----------------------------------------------------------------
treat_x_post |   ${did.didEstimate.toFixed(4)}   ${se.toFixed(4)}   ${tStat.toFixed(2)}   ${pVal < 0.001 ? "0.000" : pVal.toFixed(3)}     ${(did.didEstimate - 1.96 * se).toFixed(4)}    ${(did.didEstimate + 1.96 * se).toFixed(4)}
       _cons |     4.1209     0.0842    48.94   0.000       3.9538      4.2880
------------------------------------------------------------------------------
Absorbed degrees of freedom:
-----------------------------------------------------+
 Absorbed FE | Categories  - Redundant  = Num. Coefs |
-------------+---------------------------------------|
     unit_id |       100           0         100     |
        year |        ${config.totalPeriods}           1          ${config.totalPeriods - 1}     |
-----------------------------------------------------+

. test lead_5 lead_4 lead_3 lead_2
 ( 1)  lead_5 = 0
 ( 2)  lead_4 = 0
 ( 3)  lead_3 = 0
 ( 4)  lead_2 = 0

       F(  4,    99) =   ${config.violatePreTrend ? "7.89" : "0.82"}
            Prob > F =   ${eventStudy.preTrendPValue.toFixed(4)}

. * Monte Carlo 500-Iteration In-Space Placebo Permutation
. svmat b
. summarize b1
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
          b1 |        500     -0.0021      0.2412    -0.7812     0.8124
Empirical rejection p-value = ${placebo.empiricalPValue.toFixed(4)}
Graph exported: event_study_stata.png & placebo_test_stata.png`;
  } else {
    stdout = `> # R fixest feols estimation
> twfe_model <- feols(outcome ~ treat_post | unit_id + year, data = df, cluster = ~unit_id)
OLS estimation, Dep. Var.: outcome
Observations: ${nObs}
Fixed-effects: unit_id: 100,  year: ${config.totalPeriods}
Standard-errors: Clustered (unit_id) 
           Estimate Std. Error  t value   Pr(>|t|)    
treat_post  ${did.didEstimate.toFixed(4)}   ${se.toFixed(4)}  ${tStat.toFixed(2)}  ${pVal < 0.0001 ? "< 2.2e-16" : pVal.toFixed(4)} ***
---
Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
RMSE: 0.4812     Adj. R2: ${(r2 - 0.03).toFixed(4)}
                 Within R2: ${r2}

> # Dynamic Event Study Model (Reference Period: k = -1)
> event_model <- feols(outcome ~ i(rel_time, treat, ref = -1) | unit_id + year, data = df, cluster = ~unit_id)
Joint test for pre-trends (k <= -2):
F = ${config.violatePreTrend ? "8.14" : "0.78"}, p = ${eventStudy.preTrendPValue.toFixed(4)}
Parallel Trends Assumption: ${eventStudy.passedPreTrend ? "VALIDATED" : "VIOLATED"}

> iplot(event_model, main = "Event Study: Dynamic Treatment Effects", xlab = "Relative Time to Shock", ylab = "Treatment Effect (95% CI)")
[Device 2: Quartz / Cairo Window Active]`;
  }

  const endTime = performance.now();

  return {
    stdout,
    charts: [
      {
        title: "Parallel Trends & Counterfactual Trajectories",
        description:
          "Observed treatment group and control group trajectories with estimated counterfactual trend and policy shock timeline.",
        type: "parallel-trends",
        data: panel,
      },
      {
        title: "Dynamic Event Study: Treatment Effects with 95% CI",
        description:
          "Normalized at reference period k = -1. Pre-trend tests check for anticipation and parallel pre-trends; post-trend tracks dynamic treatment impact.",
        type: "event-study",
        data: eventStudy.coefficients,
      },
      {
        title: "Monte Carlo Placebo Permutation Distribution (N = 500)",
        description:
          "In-space placebo test randomly permutes treatment assignments 500 times. Red solid line marks the true point estimate.",
        type: "placebo-dist",
        data: placebo,
      },
    ],
    summary: {
      treatmentEffect: did.didEstimate,
      standardError: se,
      tStatistic: tStat,
      pValue: pVal,
      rSquared: r2,
      clusters: nUnits,
      observations: nObs,
      fStatisticPreTrend: config.violatePreTrend ? 8.14 : 0.78,
      preTrendPassed: eventStudy.passedPreTrend,
      placeboPValue: placebo.empiricalPValue,
    },
    executionTimeMs: Math.round(endTime - startTime + 85),
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  };
}
