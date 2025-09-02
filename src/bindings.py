from setuptools import setup, Extension
import pybind11, sysconfig

ext_modules = [
    Extension(
        "quantzlib",
        [
            "bindings.cc",
            "core/simd_math/simd_math.c",
            "core/indicators/indicators.cc",
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
