/**
 * @file simd_math.c
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#include "./simd_math.h"

double vector_sum(const double *__restrict vec, size_t len)
{
    DOUBLE vsum = SET_ZERO;

    size_t i = 0;
    for (; i + VEC_LEN - 1 < len; i += VEC_LEN)
    {
        DOUBLE v = LOAD(&vec[i]);
        vsum = ADD(vsum, v);
    }

    double temp[VEC_LEN];
    STORE(temp, vsum);

    double result = 0;
    for (int j = 0; j < VEC_LEN; j++)
        result += temp[j];

    for (; i < len; i++)
        result += vec[i];

    return result;
}

double vector_mean(const double *__restrict vec, size_t len)
{
    return vector_sum(vec, len) / (double)len;
}

double vector_multiply(const double *__restrict vec, size_t len)
{
    DOUBLE vprod = SET_X(1.0);

    size_t i = 0;
    for (; i + VEC_LEN - 1 < len; i += VEC_LEN)
    {
        DOUBLE v = LOAD(&vec[i]);
        vprod = MULTIPLY(vprod, v);
    }

    double temp[VEC_LEN];
    STORE(temp, vprod);

    double result = 1;
    for (int j = 0; j < VEC_LEN; j++)
        result *= temp[j];

    for (; i < len; i++)
        result *= vec[i];

    return result;
}

double vector_variance(const double *__restrict vec, size_t len)
{
    DOUBLE vsum = SET_ZERO, vsqsum = SET_ZERO;

    size_t i = 0;
    for (; i + VEC_LEN - 1 < len; i += VEC_LEN)
    {
        // fma(a,b,c) = a * b + c
        DOUBLE v = LOAD(&vec[i]);
        vsum = ADD(vsum, v);
        vsqsum = FMA(v, v, vsqsum);
    }

    double temp_vsum[VEC_LEN], temp_vsqsum[VEC_LEN];
    STORE(temp_vsum, vsum);
    STORE(temp_vsqsum, vsqsum);

    double sum = 0, sqsum = 0;
    for (int j = 0; j < VEC_LEN; j++)
    {
        sum += temp_vsum[j];
        sqsum += temp_vsqsum[j];
    }

    for (; i < len; ++i)
    {
        sum += vec[i];
        sqsum += vec[i] * vec[i];
    }

    double mean = sum / len;
    double variance = (sqsum / len) - (mean * mean);

    return variance;
}

double vector_std_deviation(const double *__restrict vec, size_t len)
{
    return sqrt(vector_variance(vec, len));
}

double vector_dot_product(const double *__restrict vec1, const double *__restrict vec2, size_t len)
{
    DOUBLE vsum = SET_ZERO;

    size_t i = 0;
    for (; i + VEC_LEN - 1 < len; i += VEC_LEN)
    {
        DOUBLE v1 = LOAD(&vec1[i]);
        DOUBLE v2 = LOAD(&vec2[i]);

        vsum = FMA(v1, v2, vsum);
    }

    double temp[VEC_LEN];
    STORE(temp, vsum);

    double result = 0;
    for (size_t j = 0; j < VEC_LEN; j++)
        result += temp[j];

    for (; i < len; i++)
        result += vec1[i] * vec2[i];

    return result;
}
