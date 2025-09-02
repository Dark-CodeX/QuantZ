/**
 * @file simd_math.h
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#ifndef QUANTZ_MATH_H
#define QUANTZ_MATH_H

#ifdef __cplusplus
extern "C"
{
#endif

#include <immintrin.h>
#include <math.h>
#include <stddef.h>

#define almost_equal(a, b) \
    fabs(a - b) < 1e-7

#ifdef __AVX512F__
#define DOUBLE __m512d
#define SET_ZERO _mm512_setzero_pd()
#define SET_X(__x) _mm512_set1_pd(__x)
#define LOAD(p) _mm512_loadu_pd(p)
#define STORE(p, v) _mm512_storeu_pd(p, v)
#define ADD(a, b) _mm512_add_pd(a, b)
#define SUBTRACT(a, b) _mm512_sub_pd(a, b)
#define MULTIPLY(a, b) _mm512_mul_pd(a, b)
#define DIVIDE(a, b) _mm512_div_pd(a, b)
#define FMA(a, b, c) _mm512_fmadd_pd(a, b, c)
#define SIMD_VEC_LEN 8
#define SIMD_MODE "512"

#elif defined(__AVX2__)
#define DOUBLE __m256d
#define SET_ZERO _mm256_setzero_pd()
#define SET_X(__x) _mm256_set1_pd(__x)
#define LOAD(p) _mm256_loadu_pd(p)
#define STORE(p, v) _mm256_storeu_pd(p, v)
#define ADD(a, b) _mm256_add_pd(a, b)
#define SUBTRACT(a, b) _mm256_sub_pd(a, b)
#define MULTIPLY(a, b) _mm256_mul_pd(a, b)
#define DIVIDE(a, b) _mm256_div_pd(a, b)
#define FMA(a, b, c) _mm256_fmadd_pd(a, b, c)
#define SIMD_VEC_LEN 4
#define SIMD_MODE "256"

#elif defined(__SSE2__)
#define DOUBLE __m128d
#define SET_ZERO _mm_setzero_pd()
#define SET_X(__x) _mm_set1_pd(__x)
#define LOAD(p) _mm_loadu_pd(p)
#define STORE(p, v) _mm_storeu_pd(p, v)
#define ADD(a, b) _mm_add_pd(a, b)
#define SUBTRACT(a, b) _mm_sub_pd(a, b)
#define MULTIPLY(a, b) _mm_mul_pd(a, b)
#define DIVIDE(a, b) _mm_div_pd(a, b)
#define FMA(a, b, c) _mm_fmadd_pd(a, b, c)
#define SIMD_VEC_LEN 2
#define SIMD_MODE "128"

#else
#error "No supported SIMD instruction set found."
#endif

    double vector_sum(const double *__restrict vec, size_t len);
    double vector_mean(const double *__restrict vec, size_t len);
    double vector_multiply(const double *__restrict vec, size_t len);
    double vector_variance(const double *__restrict vec, size_t len);
    double vector_std_deviation(const double *__restrict vec, size_t len);
    double vector_dot_product(const double *__restrict vec1, const double *__restrict vec2, size_t len);

#ifdef __cplusplus
}
#endif

#endif