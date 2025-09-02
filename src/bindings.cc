/**
 * @file bindings.cc
 * @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 * @author Tushar Chaurasia (Dark-CodeX)
 */

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>
extern "C"
{
#include "./core/simd_math/simd_math.h"
}
#include "./core/indicators/indicators.hh"

namespace py = pybind11;

double py_vector_sum(py::array_t<double, py::array::c_style | py::array::forcecast> arr)
{
    auto buf = arr.request();
    return vector_sum(static_cast<double *>(buf.ptr), buf.shape[0]);
}

double py_vector_mean(py::array_t<double, py::array::c_style | py::array::forcecast> arr)
{
    auto buf = arr.request();
    return vector_mean(static_cast<double *>(buf.ptr), buf.shape[0]);
}

double py_vector_variance(py::array_t<double, py::array::c_style | py::array::forcecast> arr)
{
    auto buf = arr.request();
    return vector_variance(static_cast<double *>(buf.ptr), buf.shape[0]);
}

double py_vector_std_deviation(py::array_t<double, py::array::c_style | py::array::forcecast> arr)
{
    auto buf = arr.request();
    return vector_std_deviation(static_cast<double *>(buf.ptr), buf.shape[0]);
}

double py_vector_multiply(py::array_t<double, py::array::c_style | py::array::forcecast> arr)
{
    auto buf = arr.request();
    return vector_multiply(static_cast<double *>(buf.ptr), buf.shape[0]);
}

double py_vector_dot_product(
    py::array_t<double, py::array::c_style | py::array::forcecast> a,
    py::array_t<double, py::array::c_style | py::array::forcecast> b)
{
    auto buf_a = a.request();
    auto buf_b = b.request();
    if (buf_a.shape[0] != buf_b.shape[0])
    {
        throw std::runtime_error("Input arrays must have the same length");
    }
    return vector_dot_product(
        static_cast<double *>(buf_a.ptr),
        static_cast<double *>(buf_b.ptr),
        buf_a.shape[0]);
}

PYBIND11_MODULE(quantzlib, m)
{
    m.doc() = "Quantlib bindings (SIMD + indicators)";

    m.def("SMA", &core::indicators::SMA, "Simple Moving Average");
    m.def("EMA", &core::indicators::EMA, "Exponential Moving Average");
    m.def("WMA", &core::indicators::WMA, "Weighted Moving Average");
    m.def("VWMA", &core::indicators::VWMA, "Volume-Weighted Moving Average");
    m.def("MACD", &core::indicators::MACD, "Moving Average Convergence/Divergence");
    m.def("RSI", &core::indicators::RSI, "Relative Strength Index");
    m.def("BollingerBands", &core::indicators::BollingerBands, "Bollinger Bands");
    m.def("ATR", &core::indicators::ATR, "Average True Range");

    m.def("SIMD_SUM", &py_vector_sum, "SIMD Summation");
    m.def("SIMD_MEAN", &py_vector_mean, "SIMD Mean");
    m.def("SIMD_MULTIPLY", &py_vector_multiply, "SIMD Multiplication");
    m.def("SIMD_VARIANCE", &py_vector_variance, "SIMD Variance");
    m.def("SIMD_STD_DEVIATION", &py_vector_std_deviation, "SIMD Standard Deviation");
    m.def("SIMD_DOT_PRODUCT", &py_vector_dot_product, "SIMD Dot Product");
}
