/**
 * @file indicators.hh
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#ifndef INDICATOR_HH
#define INDICATOR_HH

#include <vector>
#include <numeric>
#include <cmath>
#include <span>

#include "../simd_math/simd_math.h"

namespace engine::indicators
{
    /**
     * @brief SMA(Simple Moving Average) Indicator
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @return Average price over a specific number of periods, indicating trend direction.
     */
    std::vector<double> SMA(const std::vector<double> &prices, const std::size_t &n);

    /**
     * @brief EMA(Exponential Moving Average) Indicator
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @return Responds faster to recent price changes
     */
    std::vector<double> EMA(const std::vector<double> &prices, const std::size_t &n);

    /**
     * @brief WMA(Weighted Moving Average) Indicator
     *
     * @param prices Price over n periods
     * @param weights Weight for period
     * @param n Number of periods
     * @return Applies custom weights to price data
     */
    std::vector<double> WMA(const std::vector<double> &prices, const std::vector<double> &weights, const std::size_t &n);

    /**
     * @brief VWMA(Volume-Weighted Moving Average) Indicator
     *
     * @param prices Price over n periods
     * @param volumes Volumes for period
     * @param n Number of periods
     * @return Weights price by trading volume
     */
    std::vector<double> VWMA(const std::vector<double> &prices, const std::vector<double> &volumes, const std::size_t &n);

    /**
     * @brief MACD(Moving Average Convergence/Divergence) Indicator
     *
     * @param prices Prices over EMA periods
     * @param fast EMA periods
     * @param slow EMA periods
     * @return Shows momentum by EMA difference
     */
    std::vector<double> MACD(const std::vector<double> &prices, const std::size_t &fast, const std::size_t &slow);

    /**
     * @brief RSI Indicator
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @return Measures overbought/oversold conditions
     */
    std::vector<double> RSI(const std::vector<double> &prices, const std::size_t &n);

    /**
     * @brief
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @param k multiplier
     * @return Visualizes volatility bands
     */
    std::vector<std::vector<double>> BollingerBands(const std::vector<double> &prices, const std::size_t n, const double &k);
}

#endif