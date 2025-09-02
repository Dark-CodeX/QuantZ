#include <assert.h>
#include "./simd_math.h"
#include <stdio.h>

int main(void)
{
    double vector[] = {3.14, 7.29, 1.67, 9.85, 0.42, 6.38, 4.71, 8.93, 2.56, 5.30, 0.77, 9.12, 3.63, 1.45, 6.96, 8.02, 2.38, 7.71, 5.69, 4.04, 6.47, 0.88, 1.23, 3.86, 8.58, 7.04, 2.14, 9.67, 5.81, 4.35, 1.98, 6.23, 3.51, 0.64, 8.79, 2.92, 7.49, 9.01, 4.18, 5.56, 3.25, 1.09, 6.73, 7.95, 2.67, 0.35, 8.36, 9.76, 5.43, 4.80, 0.91, 6.11, 3.84, 2.20, 7.62, 9.32, 4.94, 5.18, 1.36, 8.87, 6.66, 3.10, 0.73, 2.05, 9.48, 7.24, 5.97, 4.07, 8.42, 1.75, 6.85, 0.19, 3.47, 2.88, 7.13, 9.95, 4.60, 5.39, 1.02, 8.25, 0.58, 3.69, 6.59, 2.34, 7.83, 4.50, 9.19, 5.02, 8.10, 1.41, 6.28, 3.93, 2.46, 0.27, 7.99, 5.74, 9.08, 4.31, 1.14, 8.63};
    double vector2[] = {4.13, 7.72, 2.86, 9.45, 1.24, 5.89, 3.61, 8.57, 0.93, 6.30, 1.78, 9.34, 4.02, 2.13, 7.46, 8.19, 0.81, 6.62, 5.18, 3.79, 6.91, 0.47, 1.69, 4.95, 8.06, 7.31, 2.09, 9.12, 5.36, 3.40, 2.27, 6.78, 1.85, 0.52, 9.03, 3.19, 7.60, 8.75, 4.07, 5.93, 2.65, 1.17, 6.49, 7.68, 3.30, 0.26, 8.94, 9.58, 5.07, 4.66, 1.53, 6.40, 2.79, 3.01, 7.85, 9.14, 4.29, 5.11, 0.98, 8.48, 6.34, 2.44, 1.12, 0.84, 9.71, 7.16, 5.43, 3.67, 8.26, 1.59, 6.96, 0.32, 2.38, 3.76, 7.07, 9.89, 4.51, 5.87, 1.25, 8.03, 0.69, 4.17, 6.12, 2.68, 7.99, 3.53, 9.36, 5.49, 8.75, 1.03, 6.57, 2.96, 3.21, 0.45, 7.64, 5.70, 9.25, 4.41, 1.30, 8.82};
    size_t len = sizeof(vector) / sizeof(*vector);

    printf("Using %s-bit mode\n", SIMD_MODE);

    double sum = vector_sum(vector, len);
    assert(almost_equal(sum, 499.38));
    puts("Test Case 1 passed!");

    double mean = vector_mean(vector, len);
    assert(almost_equal(mean, 4.9938));
    puts("Test Case 2 passed!");

    double multiply = vector_multiply(vector, len);
    assert(almost_equal(multiply, (double)4800056080175515710579377398391183313388782673931194597376.000000));
    puts("Test Case 3 passed!");

    double variance = vector_variance(vector, len);
    assert(almost_equal(variance, 8.31462956));
    puts("Test Case 4 passed!");

    double std_deviation = vector_std_deviation(vector, len);
    assert(almost_equal(std_deviation, 2.8835099375587387));
    puts("Test Case 5 passed!");

    double dot_product = vector_dot_product(vector,vector2 , len);
    assert(almost_equal(dot_product, 3289.7791999999995));
    puts("Test Case 6 passed!");

    return 0;
}