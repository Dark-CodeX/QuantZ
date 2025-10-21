"""
 @file setup.py
 @license This file is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007. You may obtain a copy of this license at https://www.gnu.org/licenses/gpl-3.0.en.html.
 @author Tushar Chaurasia (Dark-CodeX)
"""

from setuptools import setup, Extension
import pybind11, sysconfig

ext_modules = [
    Extension(
        "quantzlib",
        [
            "./setup.cc",
            "./core/simd_math/simd_math.c",
            "./core/indicators/indicators.cc",
        ],
        include_dirs=[
            pybind11.get_include(),
            pybind11.get_include(user=True),
            sysconfig.get_paths()["include"],
            "./core/simd_math",
            "./core/indicators",
        ],
        language="c++",
        extra_compile_args=["-std=c++20", "-mfma"],
    )
]

setup(
    name="quantzlib",
    ext_modules=ext_modules,
)
