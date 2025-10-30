/**
 * @file indicators.cc
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#include "./indicators.hh"

namespace core::indicators
{
    std::vector<double> WEIGHTS(const char *&__Type, const std::size_t &n)
    {
        if (n == 0 || !__Type)
            return {};
        std::vector<double> res(n, std::numeric_limits<double>::quiet_NaN());
        if (std::strcmp(__Type, "linear") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = i;
        }
        else if (std::strcmp(__Type, "normalized linear") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = (double)i / (double)n;
        }
        else if (std::strcmp(__Type, "harmonic") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = 1.0 / (double)i;
        }
        else if (std::strcmp(__Type, "triangular") == 0)
        {
            std::size_t mid = (n + 1) / 2;
            if (n % 2 == 0)
            {
                for (std::size_t i = 1; i <= mid; ++i)
                    res[i - 1] = (double)i;

                for (std::size_t i = mid; i >= 1; --i)
                    res[n - (mid - i) - 1] = (double)i;
            }
            else
            {
                for (std::size_t i = 1; i <= mid; ++i)
                    res[i - 1] = (double)i;

                for (std::size_t i = mid - 1; i >= 1; --i)
                    res[n - (mid - i) - 1] = (double)i;
            }
        }
        else if (std::strcmp(__Type, "quadratic") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = i * i;
        }
        else if (std::strcmp(__Type, "cubic") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = i * i * i;
        }
        else if (std::strcmp(__Type, "root") == 0)
        {
            for (std::size_t i = 1; i < n + 1; i++)
                res[i - 1] = std::sqrt(i);
        }
        return res;
    }

    std::vector<double> SMA(const std::vector<double> &prices, const std::size_t &n)
    {
        if (n == 0 || prices.size() < n)
            return {};

        std::vector<double> sma;
        sma.reserve(prices.size());

        double wsum = 0.0;
        for (std::size_t i = 0; i < prices.size(); i++)
        {
            wsum += prices[i];

            if (i >= n)
                wsum -= prices[i - n];

            if (i < n - 1)
                sma.emplace_back(std::numeric_limits<double>::quiet_NaN());
            else
                sma.emplace_back(wsum / n);
        }

        return sma;
    }

    std::vector<double> EMA(const std::vector<double> &prices, const std::size_t &n)
    {
        if (n == 0 || prices.size() < n)
            return {};
        std::vector<double> ema(prices.size(), std::numeric_limits<double>::quiet_NaN());

        double alpha = 2.00 / (n + 1.00);
        double ema_prev = vector_mean(prices.data(), n);
        ema[n - 1] = ema_prev;

        for (size_t i = n; i < prices.size(); i++)
        {
            double ema_curr = alpha * prices[i] + (1 - alpha) * ema_prev;
            ema[i] = ema_curr;
            ema_prev = ema_curr;
        }

        return ema;
    }

    std::vector<double> WMA(const std::vector<double> &prices, const char *weights, const std::size_t &n)
    {
        if (n == 0 || prices.size() < n)
            return {};

        std::vector<double> wma(prices.size(), std::numeric_limits<double>::quiet_NaN());
        std::vector<double> w = WEIGHTS(weights, n);
        double w_sum = vector_sum(w.data(), n);

        for (std::size_t i = n - 1; i < prices.size(); i++)
        {
            double prod_sum = 0;
            for (std::size_t j = 0; j < n; j++)
                prod_sum += w[j] * prices[i - j];
            wma[i] = prod_sum / w_sum;
        }
        return wma;
    }

    std::vector<double> VWMA(const std::vector<double> &prices, const std::vector<double> &volumes, const std::size_t &n)
    {
        if (n == 0 || prices.size() < n || volumes.size() < n)
            return {};

        std::vector<double> vwma(prices.size(), std::numeric_limits<double>::quiet_NaN());

        for (std::size_t i = n - 1; i < prices.size(); i++)
        {
            double pv_sum = 0, vl_sum = 0;
            for (std::size_t j = 0; j < n; j++)
            {
                pv_sum += prices[i - j] * volumes[i - j];
                vl_sum += volumes[i - j];
            }
            vwma[i] = (vl_sum == 0.0) ? std::numeric_limits<double>::quiet_NaN() : pv_sum / vl_sum;
        }

        return vwma;
    }

    std::vector<double> MACD(const std::vector<double> &prices, const std::size_t &fast, const std::size_t &slow)
    {
        if (fast == 0 || slow == 0 || prices.size() < std::max(fast, slow))
            return {};

        const std::vector<double> a = EMA(prices, fast);
        const std::vector<double> b = EMA(prices, slow);

        std::vector<double> macd(a.size(), std::numeric_limits<double>::quiet_NaN());

        for (std::size_t i = 0; i < a.size(); i++)
        {
            if (std::isnan(a[i]) || std::isnan(b[i]))
                macd[i] = std::numeric_limits<double>::quiet_NaN();
            else
                macd[i] = a[i] - b[i];
        }

        return macd;
    }

    std::vector<double> RSI(const std::vector<double> &prices, const std::size_t &n)
    {
        if (n == 0 || prices.size() <= n)
            return {};

        std::vector<double> gains(prices.size(), 0), losses(prices.size(), 0);

        for (std::size_t i = 1; i < prices.size(); i++)
        {
            double delta = prices[i] - prices[i - 1];
            if (delta > 0)
                gains[i] = delta;
            else
                losses[i] = -delta;
        }
        double mean_gains = vector_mean(gains.data(), n), mean_losses = vector_mean(losses.data(), n);

        std::vector<double> rsi(prices.size(), std::numeric_limits<double>::quiet_NaN());
        double rs = (mean_losses == 0) ? std::numeric_limits<double>::infinity() : mean_gains / mean_losses;
        rsi[n] = 100.0 - (100.0 / (1 + rs));

        for (std::size_t i = n + 1; i < gains.size(); i++)
        {
            mean_gains = (mean_gains * (n - 1) + gains[i]) / n;
            mean_losses = (mean_losses * (n - 1) + losses[i]) / n;
            rs = (mean_losses == 0) ? std::numeric_limits<double>::infinity() : mean_gains / mean_losses;
            rsi[i] = 100.0 - (100.0 / (1 + rs));
        }
        return rsi;
    }

    std::vector<std::vector<double>> BollingerBands(const std::vector<double> &prices, const std::size_t n, const double &k)
    {
        if (n == 0 || prices.size() < n)
            return {};

        std::vector<double> middle = SMA(prices, n);
        std::vector<double> upper(prices.size(), std::numeric_limits<double>::quiet_NaN());
        std::vector<double> lower(prices.size(), std::numeric_limits<double>::quiet_NaN());

        for (std::size_t i = n - 1; i < prices.size(); ++i)
        {
            std::span<const double> slice(prices.data() + i - n + 1, prices.data() + i + 1);
            double sd = vector_std_deviation(slice.data(), slice.size());

            if (!std::isnan(middle[i]))
            {
                upper[i] = middle[i] + k * sd;
                lower[i] = middle[i] - k * sd;
            }
        }

        std::vector<std::vector<double>> bb(3);
        bb[0] = std::move(middle);
        bb[1] = std::move(upper);
        bb[2] = std::move(lower);

        return bb;
    }

    std::vector<double> ATR(const std::vector<double> &highs, const std::vector<double> &lows, const std::vector<double> &closes, const std::size_t &n)
    {
        if (highs.size() != lows.size() || highs.size() != closes.size() || highs.empty())
            return {};

        std::vector<double> true_range(highs.size(), std::numeric_limits<double>::quiet_NaN());
        true_range[0] = highs[0] - lows[0];

        for (std::size_t i = 1; i < highs.size(); i++)
        {
            true_range[i] = MAX_3(highs[i] - lows[i], std::abs(highs[i] - closes[i - 1]), std::abs(lows[i] - closes[i - 1]));
        }

        return SMA(true_range, n);
    }

    std::vector<double> Momentum(const std::vector<double> &prices, const std::size_t n)
    {
        if (n == 0 || prices.size() <= n)
            return {};
        std::vector<double> momentum_values(prices.size(), std::numeric_limits<double>::quiet_NaN());
        for (std::size_t i = n; i < prices.size(); i++)
            momentum_values[i] = prices[i] - prices[i - n];
        return momentum_values;
    }
}
