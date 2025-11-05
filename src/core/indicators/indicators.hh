/**
 * @file indicators.hh
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#ifndef QUANTZ_INDICATOR_HH
#define QUANTZ_INDICATOR_HH

#include <vector>
#include <numeric>
#include <cmath>
#include <span>
#include <cstring>

#include "../simd_math/simd_math.h"

#define MAX_3(a, b, c) (a > b ? (a > c ? a : c) : (b > c ? b : c))

#define MAX_2(a, b) (a > b ? a : b)

namespace core::indicators
{
    /**
     * @brief Returns weights array of type `__Type`
     *
     * @param __Type Type of weights {"Linear", "Harmonic", "Triangular", "Normalized Linear", "Quadratic", "Cubic", "Root"}
     * @param n Number of periods
     * @return Weights of type `__Type`
     */
    std::vector<double> WEIGHTS(const char *__Type, const std::size_t &n);

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
    std::vector<double> WMA(const std::vector<double> &prices, const char *weights, const std::size_t &n);

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
     * @brief RSI(Relative Strength Index) Indicator
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @return Measures overbought/oversold conditions
     */
    std::vector<double> RSI(const std::vector<double> &prices, const std::size_t &n);

    /**
     * @brief Bollinger Bands Indicator
     *
     * @param prices Price over n periods
     * @param n Number of periods
     * @param k multiplier
     * @return Visualizes volatility bands
     */
    std::vector<std::vector<double>> BollingerBands(const std::vector<double> &prices, const std::size_t n, const double &k);

    /**
     * @brief  ATR(Average True Range) Indicator
     *
     * @param highs High prices over n periods
     * @param lows Low prices over n periods
     * @param closes Closing prices over n periods
     * @param n Number of periods
     * @return Measures market volatility
     */
    std::vector<double> ATR(const std::vector<double> &highs, const std::vector<double> &lows, const std::vector<double> &closes, const std::size_t &n);

    /**
     * @brief Momentum Indicator
     *
     * @param pricesPrice over n periods
     * @param n Number of periods
     * @return Absolute price change
     */
    std::vector<double> Momentum(const std::vector<double> &prices, const std::size_t n);
}

#endif