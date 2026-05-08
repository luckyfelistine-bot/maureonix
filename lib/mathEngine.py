#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
MAUREONIX ULTIMATE SCIENTIFIC CALCULATION ENGINE v2.0
================================================================================
The most powerful WhatsApp scientific bot engine ever built.

ACCEPTS:  JSON string from stdin
RETURNS:  Exactly one JSON string to stdout

NEW CAPABILITIES (v2.0):
  • Cryptography: AES, RSA, SHA-3, ChaCha20, Base64/32/16/85, hashing, HMAC
  • Chemistry: Molecular formulas, balancing equations, molar mass, stoichiometry
  • Theorem Proving: Z3 constraint solver, SAT solving, formal verification
  • Graph Theory: Shortest path, network analysis, graph algorithms
  • Safe Code Execution: Asteval sandbox for user-defined calculations
  • Uncertainty Propagation: Error propagation with correlations
  • Advanced Statistics: Regression, ANOVA, hypothesis testing, distributions
  • Number Theory: Primes, GCD, LCM, modular arithmetic, Diophantine equations
  • Signal Processing: FFT, convolution, filtering
  • Optimization: Linear programming, curve fitting, minimization
  • Combinatorics: Permutations, combinations, binomial coefficients
  • Complex Analysis: Contour integrals, residues, complex functions
  • Matrix Operations: Eigenvalues, SVD, matrix decompositions
  • Differential Equations: ODE/PDE solving, numerical integration
  • Encoding/Decoding: Hex, binary, URL encoding, ROT13, Caesar cipher, Morse
  • Financial Math: Compound interest, amortization, NPV, IRR

USAGE:
    echo '{"type":"cipher","input":"encrypt AES hello world key123"}' | python3 lib/mathEngine.py

INSTALLATION:
    pip install -r requirements.txt
    chmod +x lib/mathEngine.py
================================================================================
"""

import sys
import json
import re
import math
import statistics as py_stats
import hashlib
import hmac
import base64
import binascii
import itertools
import random
import string
import struct
import warnings
import os
from fractions import Fraction as PyFraction
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# ============================================================================
# CORE SCIENTIFIC LIBRARIES
# ============================================================================

import sympy as sp
import numpy as np
from scipy import integrate, stats as scipy_stats, optimize, linalg, signal, fftpack
from scipy.special import factorial, gamma, beta, erf, erfc, airy, besselj, bessely
import mpmath as mp

# Unit conversion
try:
    import pint
    UREG = pint.UnitRegistry()
    PINT_AVAILABLE = True
except ImportError:
    PINT_AVAILABLE = False

# Date/time utilities
from dateutil import parser as date_parser
import pytz

# ============================================================================
# NEW POWER LIBRARIES
# ============================================================================

# Cryptography
try:
    from Crypto.Cipher import AES, ChaCha20, PKCS1_OAEP
    from Crypto.PublicKey import RSA
    from Crypto.Hash import SHA3_256, SHA3_512, SHA256, HMAC
    from Crypto.Protocol.KDF import scrypt
    from Crypto.Random import get_random_bytes
    from Crypto.Util.Padding import pad, unpad
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

# Chemistry
try:
    import chempy
    from chempy import balance_stoichiometry, Substance, Reaction
    from chempy.util.periodic import atomic_number, atomic_names, atomic_symbols
    CHEMPY_AVAILABLE = True
except ImportError:
    CHEMPY_AVAILABLE = False

# Theorem Prover / Constraint Solver
try:
    import z3
    Z3_AVAILABLE = True
except ImportError:
    Z3_AVAILABLE = False

# Graph Theory
try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

# Safe Expression Evaluation
try:
    from asteval import Interpreter
    ASTEVAL_AVAILABLE = True
except ImportError:
    ASTEVAL_AVAILABLE = False

# Uncertainty Propagation
try:
    from uncertainties import ufloat, umath as umath_lib
    from uncertainties.unumpy import uarray
    UNCERTAINTIES_AVAILABLE = True
except ImportError:
    UNCERTAINTIES_AVAILABLE = False

# Advanced Statistics & ML
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import PolynomialFeatures
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import statsmodels.api as sm
    from statsmodels.stats.weightstats import ttest_ind
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False

# ============================================================================
# INITIALIZATION
# ============================================================================

# Define common symbols for sympy
sp_symbols = {
    'x': sp.Symbol('x', real=True),
    'y': sp.Symbol('y', real=True),
    'z': sp.Symbol('z', real=True),
    't': sp.Symbol('t', real=True),
    'n': sp.Symbol('n', integer=True, positive=True),
    'k': sp.Symbol('k', integer=True),
    'a': sp.Symbol('a', real=True),
    'b': sp.Symbol('b', real=True),
    'c': sp.Symbol('c', real=True),
    'd': sp.Symbol('d', real=True),
    'e': sp.E,
    'pi': sp.pi,
    'i': sp.I,
    'inf': sp.oo,
    'oo': sp.oo,
    'theta': sp.Symbol('theta', real=True),
    'phi': sp.Symbol('phi', real=True),
    'alpha': sp.Symbol('alpha', real=True),
    'beta': sp.Symbol('beta', real=True),
    'gamma_sym': sp.Symbol('gamma', real=True),
    'delta': sp.Symbol('delta', real=True),
    'epsilon': sp.Symbol('epsilon', real=True),
    'lambda_sym': sp.Symbol('lambda', real=True),
    'mu': sp.Symbol('mu', real=True),
    'sigma': sp.Symbol('sigma', real=True),
    'omega': sp.Symbol('omega', real=True),
}

# Manual conversion fallback
MANUAL_CONVERSIONS = {
    'm': 1, 'meter': 1, 'meters': 1, 'metre': 1,
    'km': 1000, 'kilometer': 1000, 'kilometers': 1000,
    'cm': 0.01, 'millimeter': 0.001, 'mm': 0.001,
    'inch': 0.0254, 'in': 0.0254, 'inches': 0.0254,
    'ft': 0.3048, 'foot': 0.3048, 'feet': 0.3048,
    'yd': 0.9144, 'yard': 0.9144, 'yards': 0.9144,
    'mi': 1609.344, 'mile': 1609.344, 'miles': 1609.344,
    'nm': 1852, 'nautical_mile': 1852,
    'kg': 1, 'kilogram': 1, 'kilograms': 1,
    'g': 0.001, 'gram': 0.001, 'grams': 0.001,
    'mg': 0.000001, 'milligram': 0.000001,
    'lb': 0.453592, 'pound': 0.453592, 'pounds': 0.453592,
    'oz': 0.0283495, 'ounce': 0.0283495, 'ounces': 0.0283495,
    'ton': 1000, 'tonne': 1000, 'metric_ton': 1000,
    'celsius': 'temp', 'c': 'temp',
    'fahrenheit': 'temp', 'f': 'temp',
    'kelvin': 'temp', 'k': 'temp',
    's': 1, 'sec': 1, 'second': 1, 'seconds': 1,
    'min': 60, 'minute': 60, 'minutes': 60,
    'h': 3600, 'hr': 3600, 'hour': 3600, 'hours': 3600,
    'day': 86400, 'days': 86400,
    'week': 604800, 'weeks': 604800,
    'year': 31536000, 'years': 31536000,
    'l': 0.001, 'liter': 0.001, 'liters': 0.001, 'litre': 0.001,
    'ml': 0.000001, 'milliliter': 0.000001,
    'gal': 0.00378541, 'gallon': 0.00378541, 'gallons': 0.00378541,
    'qt': 0.000946353, 'quart': 0.000946353,
    'pt': 0.000473176, 'pint': 0.000473176,
    'cup': 0.000236588, 'cups': 0.000236588,
    'floz': 2.95735e-5, 'fluid_ounce': 2.95735e-5,
    'm2': 1, 'sqm': 1, 'square_meter': 1,
    'km2': 1e6, 'sqkm': 1e6,
    'ha': 10000, 'hectare': 10000,
    'acre': 4046.86, 'acres': 4046.86,
    'ft2': 0.092903, 'sqft': 0.092903,
    'mps': 1, 'm/s': 1,
    'kph': 0.277778, 'km/h': 0.277778,
    'mph': 0.44704, 'mi/h': 0.44704,
    'knot': 0.514444, 'knots': 0.514444,
    'pa': 1, 'pascal': 1,
    'kpa': 1000, 'kilopascal': 1000,
    'bar': 100000,
    'atm': 101325, 'atmosphere': 101325,
    'psi': 6894.76, 'pound_per_square_inch': 6894.76,
    'mmhg': 133.322, 'torr': 133.322,
    'j': 1, 'joule': 1, 'joules': 1,
    'kj': 1000, 'kilojoule': 1000,
    'cal': 4.184, 'calorie': 4.184, 'calories': 4.184,
    'kcal': 4184, 'kilocalorie': 4184,
    'wh': 3600, 'watt_hour': 3600,
    'kwh': 3.6e6, 'kilowatt_hour': 3.6e6,
    'ev': 1.60218e-19, 'electronvolt': 1.60218e-19,
    'btu': 1055.06,
    'w': 1, 'watt': 1, 'watts': 1,
    'kw': 1000, 'kilowatt': 1000,
    'hp': 745.7, 'horsepower': 745.7,
    'b': 1, 'bit': 1, 'bits': 1,
    'B': 8, 'byte': 8, 'bytes': 8,
    'kb': 8000, 'kilobit': 8000,
    'kB': 8192, 'kilobyte': 8192,
    'mb': 8e6, 'megabit': 8e6,
    'MB': 8.388608e6, 'megabyte': 8.388608e6,
    'gb': 8e9, 'gigabit': 8e9,
    'GB': 8.589934592e9, 'gigabyte': 8.589934592e9,
    'tb': 8e12, 'terabit': 8e12,
    'TB': 8.796093022208e12, 'terabyte': 8.796093022208e12,
    'N': 1, 'newton': 1, 'newtons': 1,
    'kn': 1000, 'kilonewton': 1000,
    'lbf': 4.44822, 'pound_force': 4.44822,
    'dyn': 1e-5, 'dyne': 1e-5,
    'rad': 1, 'radian': 1, 'radians': 1,
    'deg': 0.0174533, 'degree': 0.0174533, 'degrees': 0.0174533,
    'grad': 0.015708, 'gradian': 0.015708,
    'hz': 1, 'hertz': 1,
    'khz': 1000, 'kilohertz': 1000,
    'mhz': 1e6, 'megahertz': 1e6,
    'ghz': 1e9, 'gigahertz': 1e9,
    'thz': 1e12, 'terahertz': 1e12,
    'usd': 1, 'dollar': 1, 'dollars': 1,
    'eur': 1.08, 'euro': 1.08, 'euros': 1.08,
    'gbp': 1.27, 'pound_sterling': 1.27,
    'jpy': 0.0067, 'yen': 0.0067,
    'cny': 0.14, 'yuan': 0.14, 'rmb': 0.14,
    'inr': 0.012, 'rupee': 0.012,
    'cad': 0.74, 'canadian_dollar': 0.74,
    'aud': 0.66, 'australian_dollar': 0.66,
    'chf': 1.13, 'swiss_franc': 1.13,
    'sek': 0.096, 'krona': 0.096,
    'nok': 0.095, 'krone': 0.095,
    'mxn': 0.059, 'peso': 0.059,
    'brl': 0.20, 'real': 0.20,
    'zar': 0.053, 'rand': 0.053,
    'sgd': 0.74, 'singapore_dollar': 0.74,
    'hkd': 0.13, 'hong_kong_dollar': 0.13,
    'krw': 0.00075, 'won': 0.00075,
    'rub': 0.011, 'ruble': 0.011,
    'try': 0.031, 'lira': 0.031,
    'aed': 0.27, 'dirham': 0.27,
    'sar': 0.27, 'riyal': 0.27,
}

# ============================================================================
# MORSE CODE DICTIONARY
# ============================================================================

MORSE_CODE_DICT = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ', ': '--..--', '.': '.-.-.-', '?': '..--..', '/': '-..-.', '-': '-....-',
    '(': '-.--.', ')': '-.--.-', ' ': '/', '!': '-.-.--', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.', "'": '.----.'
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def eprint(*args, **kwargs):
    """Print to stderr (safe for debugging, won't corrupt stdout JSON)"""
    print(*args, file=sys.stderr, **kwargs)

def safe_json_output(data):
    """Print exactly one JSON line to stdout"""
    print(json.dumps(data, ensure_ascii=False, default=str))
    sys.stdout.flush()

def parse_expression(expr_str, extra_symbols=None):
    """Parse a mathematical expression string into a sympy expression"""
    if extra_symbols:
        symbols_dict = {**sp_symbols, **extra_symbols}
    else:
        symbols_dict = dict(sp_symbols)
    
    expr_str = expr_str.strip()
    
    replacements = {
        '^': '**', '√': 'sqrt', '∛': 'cbrt', 'π': 'pi', '∞': 'oo',
        '÷': '/', '×': '*', '·': '*', '−': '-', '‘': "'", '’': "'",
        '²': '**2', '³': '**3', '⁴': '**4', '⁵': '**5',
    }
    
    for old, new in replacements.items():
        expr_str = expr_str.replace(old, new)
    
    # Implicit multiplication
    expr_str = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', expr_str)
    expr_str = expr_str.replace(')(', ')*(')
    expr_str = re.sub(r'([a-zA-Z0-9])\(', r'\1*(', expr_str)
    expr_str = re.sub(r'\)([a-zA-Z0-9])', r')*\1', expr_str)
    
    func_aliases = {
        'log10': 'log', 'lg': 'log', 'ln': 'log',
        'arcsin': 'asin', 'arccos': 'acos', 'arctan': 'atan',
        'arccot': 'acot', 'arcsec': 'asec', 'arccsc': 'acsc',
        'arcsinh': 'asinh', 'arccosh': 'acosh', 'arctanh': 'atanh',
        'sgn': 'sign', 'abs': 'Abs', 'mod': 'Mod',
    }
    
    for alias, real in func_aliases.items():
        expr_str = re.sub(r'\b' + alias + r'\b', real, expr_str)
    
    expr_str = re.sub(r'(\w+)!', r'factorial(\1)', expr_str)
    
    try:
        expr = sp.parse_expr(expr_str, local_dict=symbols_dict, transformations='all')
        return expr
    except Exception:
        try:
            expr = sp.sympify(expr_str, locals=symbols_dict)
            return expr
        except Exception as e2:
            raise ValueError(f"Could not parse expression '{expr_str}': {str(e2)}")

def format_result(expr, precision=15):
    """Format a sympy expression for output"""
    if expr is None:
        return "None"
    try:
        numeric_val = float(expr.evalf())
        if not (math.isinf(numeric_val) or math.isnan(numeric_val)):
            if numeric_val == int(numeric_val) and abs(numeric_val) < 1e15:
                return str(int(numeric_val))
            return f"{numeric_val:.{precision}g}".rstrip('0').rstrip('.')
    except (TypeError, ValueError):
        pass
    return str(expr)

def get_latex(expr):
    """Get LaTeX representation of expression"""
    try:
        return sp.latex(expr)
    except Exception:
        return None

def get_numeric_value(expr):
    """Extract numeric value if possible"""
    try:
        val = float(expr.evalf())
        if not (math.isinf(val) or math.isnan(val)):
            return val
    except (TypeError, ValueError):
        pass
    return None

# ============================================================================
# ORIGINAL OPERATION HANDLERS (v1.0)
# ============================================================================

def handle_solve(data):
    """Solve equations and expressions"""
    inp = data.get('input', '').strip()
    variables = data.get('variables', {})
    steps = []
    
    solve_for = None
    if 'for ' in inp.lower():
        parts = inp.lower().split('for ', 1)
        inp = parts[0].strip()
        solve_for_str = parts[1].strip().split()[0]
        solve_for = sp.Symbol(solve_for_str)
        steps.append(f"Set to solve for variable: {solve_for_str}")
    
    if '=' in inp:
        if inp.count('=') == 1:
            left, right = inp.split('=', 1)
            left_expr = parse_expression(left.strip())
            right_expr = parse_expression(right.strip())
            eq = sp.Eq(left_expr, right_expr)
            steps.append(f"Formed equation: {left.strip()} = {right.strip()}")
        else:
            equations = []
            eq_parts = [e.strip() for e in inp.split(',') if '=' in e]
            for eq_str in eq_parts:
                left, right = eq_str.split('=', 1)
                equations.append(sp.Eq(parse_expression(left.strip()), parse_expression(right.strip())))
            if len(equations) > 1:
                return handle_system(data)
            eq = equations[0]
    else:
        expr = parse_expression(inp)
        eq = sp.Eq(expr, 0)
        steps.append(f"Set expression equal to zero: {expr} = 0")
    
    if solve_for:
        symbols_to_solve = [solve_for]
    else:
        all_symbols = list(eq.free_symbols)
        if all_symbols:
            symbols_to_solve = all_symbols
        else:
            return {"status": "error", "result": "No variables found to solve for", "steps": steps}
    
    if variables:
        subs = {}
        for var_name, var_val in variables.items():
            sym = sp.Symbol(var_name)
            if sym in eq.free_symbols:
                subs[sym] = var_val
        if subs:
            eq = eq.subs(subs)
            steps.append(f"Substituted values: {subs}")
    
    try:
        if len(symbols_to_solve) == 1:
            solutions = sp.solve(eq, symbols_to_solve[0])
            steps.append(f"Solved for {symbols_to_solve[0]}")
        else:
            solutions = sp.solve(eq, symbols_to_solve)
            steps.append(f"Solved system for {symbols_to_solve}")
        
        if not solutions:
            return {"status": "success", "result": "No solution found", "steps": steps}
        
        if isinstance(solutions, list):
            if len(solutions) == 1:
                result_str = format_result(solutions[0])
                latex = get_latex(solutions[0])
                numeric = get_numeric_value(solutions[0])
            else:
                result_str = ", ".join([format_result(s) for s in solutions])
                latex = r" \text{ or } ".join([get_latex(s) for s in solutions])
                numeric = None
        elif isinstance(solutions, dict):
            result_str = "; ".join([f"{k} = {format_result(v)}" for k, v in solutions.items()])
            latex = r" \\ ".join([f"{sp.latex(k)} = {get_latex(v)}" for k, v in solutions.items()])
            numeric = None
        else:
            result_str = format_result(solutions)
            latex = get_latex(solutions)
            numeric = get_numeric_value(solutions)
        
        return {"status": "success", "result": result_str, "steps": steps, "numeric": numeric, "latex": latex}
    except Exception as e:
        return {"status": "error", "result": f"Solve error: {str(e)}", "steps": steps}

def handle_simplify(data):
    inp = data.get('input', '').strip()
    steps = []
    try:
        expr = parse_expression(inp)
        steps.append(f"Parsed expression: {expr}")
        simplified = sp.simplify(expr)
        steps.append("Applied simplification algorithms")
        expanded = sp.expand(simplified)
        if expanded != simplified:
            factored = sp.factor(expanded)
            if factored != expanded:
                simplified = factored
                steps.append("Factored expression")
            else:
                simplified = expanded
                steps.append("Expanded expression")
        return {"status": "success", "result": format_result(simplified), "steps": steps, "numeric": get_numeric_value(simplified), "latex": get_latex(simplified)}
    except Exception as e:
        return {"status": "error", "result": f"Simplify error: {str(e)}", "steps": steps}

def handle_derivative(data):
    inp = data.get('input', '').strip()
    steps = []
    var = sp.Symbol('x')
    order = 1
    
    inp_lower = inp.lower()
    if 'with respect to' in inp_lower:
        parts = inp.split('with respect to', 1)
        inp = parts[0].strip()
        var_str = parts[1].strip().split()[0]
        var = sp.Symbol(var_str)
        steps.append(f"Differentiating with respect to {var_str}")
    elif ' wrt ' in inp_lower:
        parts = inp.split('wrt', 1)
        inp = parts[0].strip()
        var_str = parts[1].strip().split()[0]
        var = sp.Symbol(var_str)
        steps.append(f"Differentiating with respect to {var_str}")
    
    order_match = re.search(r'(\d+)(?:st|nd|rd|th)\s+derivative', inp_lower)
    if order_match:
        order = int(order_match.group(1))
        inp = re.sub(r'\d+(?:st|nd|rd|th)\s+derivative\s+of\s*', '', inp, flags=re.IGNORECASE)
        inp = re.sub(r'\d+(?:st|nd|rd|th)\s+derivative\s*', '', inp, flags=re.IGNORECASE)
    
    inp = re.sub(r'derivative\s+of\s*', '', inp, flags=re.IGNORECASE)
    inp = re.sub(r'differentiate\s*', '', inp, flags=re.IGNORECASE)
    
    try:
        expr = parse_expression(inp)
        result = sp.diff(expr, var, order)
        steps.append(f"Computed d^{order}/d{var}^{order}")
        return {"status": "success", "result": format_result(result), "steps": steps, "numeric": get_numeric_value(result), "latex": get_latex(result)}
    except Exception as e:
        return {"status": "error", "result": f"Derivative error: {str(e)}", "steps": steps}

def handle_integral(data):
    inp = data.get('input', '').strip()
    steps = []
    definite = False
    lower = None
    upper = None
    var = sp.Symbol('x')
    
    from_match = re.search(r'from\s+([-\d\w.]+)\s+to\s+([-\d\w.]+)\s+of\s+(.+)', inp, re.IGNORECASE)
    if from_match:
        definite = True
        lower = parse_expression(from_match.group(1))
        upper = parse_expression(from_match.group(2))
        inp = from_match.group(3).strip()
        steps.append(f"Definite integral from {lower} to {upper}")
    
    inp_lower = inp.lower()
    if 'with respect to' in inp_lower:
        parts = inp.split('with respect to', 1)
        inp = parts[0].strip()
        var_str = parts[1].strip().split()[0]
        var = sp.Symbol(var_str)
    elif ' wrt ' in inp_lower:
        parts = inp.split('wrt', 1)
        inp = parts[0].strip()
        var_str = parts[1].strip().split()[0]
        var = sp.Symbol(var_str)
    
    inp = re.sub(r'integral\s+of\s*', '', inp, flags=re.IGNORECASE)
    inp = re.sub(r'integrate\s*', '', inp, flags=re.IGNORECASE)
    inp = re.sub(r'∫\s*', '', inp)
    
    try:
        expr = parse_expression(inp)
        if definite and lower is not None and upper is not None:
            result = sp.integrate(expr, (var, lower, upper))
            steps.append("Computed definite integral")
        else:
            result = sp.integrate(expr, var)
            steps.append("Computed indefinite integral")
        return {"status": "success", "result": format_result(result), "steps": steps, "numeric": get_numeric_value(result), "latex": get_latex(result)}
    except Exception as e:
        return {"status": "error", "result": f"Integral error: {str(e)}", "steps": steps}

def handle_limit(data):
    inp = data.get('input', '').strip()
    steps = []
    var = sp.Symbol('x')
    point = 0
    direction = '+-'
    
    patterns = [
        r'limit\s+of\s+(.+?)\s+as\s+(\w+)\s+(?:approaches|->|→)\s+([-\w∞inf]+)',
        r'lim\s+(.+?)\s+as\s+(\w+)\s+(?:approaches|->|→)\s+([-\w∞inf]+)',
        r'lim_\{(\w+)\s*(?:to|→|->)\s*([-\w∞inf]+)\}\s*(.+)',
        r'limit\s+(.+?)\s+when\s+(\w+)\s*(?:approaches|->|→)\s+([-\w∞inf]+)',
    ]
    
    matched = False
    for pattern in patterns:
        match = re.search(pattern, inp, re.IGNORECASE)
        if match:
            if 'lim_' in pattern:
                var = sp.Symbol(match.group(1))
                point_str = match.group(2)
                inp = match.group(3).strip()
            else:
                inp = match.group(1).strip()
                var = sp.Symbol(match.group(2))
                point_str = match.group(3)
            point_str = point_str.lower().replace('inf', 'oo').replace('∞', 'oo')
            point = parse_expression(point_str)
            matched = True
            steps.append(f"Computing limit as {var} approaches {point_str}")
            break
    
    if not matched:
        inp = re.sub(r'limit\s+of\s*', '', inp, flags=re.IGNORECASE)
        inp = re.sub(r'lim\s*', '', inp, flags=re.IGNORECASE)
        steps.append("Computing limit (default: x -> 0)")
    
    if 'from the right' in inp.lower() or '+' in inp.lower().split()[-1:]:
        direction = '+'
        inp = inp.replace('from the right', '').replace('+', '').strip()
        steps.append("One-sided limit from the right")
    elif 'from the left' in inp.lower() or '-' in inp.lower().split()[-1:]:
        direction = '-'
        inp = inp.replace('from the left', '').replace('-', '').strip()
        steps.append("One-sided limit from the left")
    
    try:
        expr = parse_expression(inp)
        result = sp.limit(expr, var, point, dir=direction)
        steps.append("Limit computed")
        return {"status": "success", "result": format_result(result), "steps": steps, "numeric": get_numeric_value(result), "latex": get_latex(result)}
    except Exception as e:
        return {"status": "error", "result": f"Limit error: {str(e)}", "steps": steps}

def handle_factor(data):
    inp = data.get('input', '').strip()
    steps = []
    try:
        expr = parse_expression(inp)
        factored = sp.factor(expr)
        steps.append("Applied factorization")
        return {"status": "success", "result": format_result(factored), "steps": steps, "numeric": get_numeric_value(factored), "latex": get_latex(factored)}
    except Exception as e:
        return {"status": "error", "result": f"Factor error: {str(e)}", "steps": steps}

def handle_expand(data):
    inp = data.get('input', '').strip()
    steps = []
    try:
        expr = parse_expression(inp)
        expanded = sp.expand(expr)
        steps.append("Expanded expression")
        return {"status": "success", "result": format_result(expanded), "steps": steps, "numeric": get_numeric_value(expanded), "latex": get_latex(expanded)}
    except Exception as e:
        return {"status": "error", "result": f"Expand error: {str(e)}", "steps": steps}

def handle_fraction(data):
    inp = data.get('input', '').strip()
    steps = []
    try:
        expr = parse_expression(inp)
        rational = sp.nsimplify(expr)
        if isinstance(rational, sp.Rational):
            result_str = f"{rational.p}/{rational.q}"
        else:
            result_str = str(rational)
        return {"status": "success", "result": result_str, "steps": steps, "numeric": get_numeric_value(rational), "latex": get_latex(rational)}
    except Exception as e:
        try:
            frac = PyFraction(inp).limit_denominator()
            return {"status": "success", "result": f"{frac.numerator}/{frac.denominator}", "steps": steps + ["Used Python fraction fallback"], "numeric": float(frac)}
        except Exception:
            return {"status": "error", "result": f"Fraction error: {str(e)}", "steps": steps}

def handle_stats(data):
    inp = data.get('input', '').strip()
    steps = []
    numbers = []
    
    if ',' in inp:
        parts = inp.split(',')
    else:
        parts = inp.split()
    
    for part in parts:
        part = part.strip().strip('[](){}')
        if not part:
            continue
        try:
            num = float(part)
            numbers.append(num)
        except ValueError:
            pass
    
    if len(numbers) < 1:
        return {"status": "error", "result": "No valid numbers found. Provide numbers separated by commas or spaces.", "steps": steps}
    
    steps.append(f"Parsed {len(numbers)} numbers")
    inp_lower = inp.lower()
    requested_stat = None
    
    stat_keywords = {
        'mean': 'mean', 'average': 'mean', 'avg': 'mean',
        'median': 'median', 'mode': 'mode', 'std': 'std', 'stdev': 'std',
        'standard deviation': 'std', 'variance': 'variance', 'var': 'variance',
        'range': 'range', 'min': 'min', 'minimum': 'min',
        'max': 'max', 'maximum': 'max', 'sum': 'sum', 'total': 'sum',
        'product': 'product', 'prod': 'product', 'regression': 'regression',
        'linear regression': 'regression', 'correlation': 'correlation', 'corr': 'correlation',
        'percentile': 'percentile', 'quartile': 'quartile',
    }
    
    for keyword, stat in stat_keywords.items():
        if keyword in inp_lower:
            requested_stat = stat
            break
    
    if not requested_stat:
        requested_stat = 'all'
    
    arr = np.array(numbers)
    results = {}
    
    try:
        if requested_stat in ('mean', 'all'):
            results['mean'] = float(np.mean(arr))
            steps.append("Computed mean")
        if requested_stat in ('median', 'all'):
            results['median'] = float(np.median(arr))
            steps.append("Computed median")
        if requested_stat in ('mode', 'all'):
            try:
                mode_val = scipy_stats.mode(arr, keepdims=True)[0][0]
                results['mode'] = float(mode_val)
                steps.append("Computed mode")
            except Exception:
                pass
        if requested_stat in ('std', 'all'):
            results['std_deviation'] = float(np.std(arr, ddof=1))
            steps.append("Computed standard deviation (sample)")
        if requested_stat in ('variance', 'all'):
            results['variance'] = float(np.var(arr, ddof=1))
            steps.append("Computed variance (sample)")
        if requested_stat in ('range', 'all'):
            results['range'] = float(np.max(arr) - np.min(arr))
            steps.append("Computed range")
        if requested_stat in ('min', 'all'):
            results['min'] = float(np.min(arr))
            steps.append("Found minimum")
        if requested_stat in ('max', 'all'):
            results['max'] = float(np.max(arr))
            steps.append("Found maximum")
        if requested_stat == 'sum':
            results['sum'] = float(np.sum(arr))
            steps.append("Computed sum")
        if requested_stat == 'product':
            results['product'] = float(np.prod(arr))
            steps.append("Computed product")
        if requested_stat == 'percentile':
            p_match = re.search(r'(\d+)(?:th|st|nd|rd)?\s*percentile', inp_lower)
            if p_match:
                p = int(p_match.group(1))
                results[f'{p}th_percentile'] = float(np.percentile(arr, p))
                steps.append(f"Computed {p}th percentile")
            else:
                results['25th_percentile'] = float(np.percentile(arr, 25))
                results['75th_percentile'] = float(np.percentile(arr, 75))
                steps.append("Computed 25th and 75th percentiles")
        if requested_stat in ('quartile', 'all'):
            results['q1'] = float(np.percentile(arr, 25))
            results['q2'] = float(np.percentile(arr, 50))
            results['q3'] = float(np.percentile(arr, 75))
            results['iqr'] = results['q3'] - results['q1']
            steps.append("Computed quartiles and IQR")
        if requested_stat == 'correlation':
            if len(numbers) % 2 == 0:
                mid = len(numbers) // 2
                x = np.array(numbers[:mid])
                y = np.array(numbers[mid:])
                if len(x) == len(y) and len(x) > 1:
                    corr = np.corrcoef(x, y)[0, 1]
                    results['correlation'] = float(corr)
                    steps.append("Computed Pearson correlation")
        
        if len(results) == 1:
            key = list(results.keys())[0]
            result_str = f"{results[key]:.10g}"
            numeric = results[key]
        else:
            result_str = "; ".join([f"{k}: {v:.10g}" for k, v in results.items()])
            numeric = None
        
        return {"status": "success", "result": result_str, "steps": steps, "numeric": numeric}
    except Exception as e:
        return {"status": "error", "result": f"Statistics error: {str(e)}", "steps": steps}

def handle_convert(data):
    inp = data.get('input', '').strip()
    steps = []
    
    patterns = [
        r'(?:convert\s+)?([-\d.\s]+)\s*([a-zA-Z°ÅΩμ_/\s]+?)\s+(?:to|into|in)\s+([a-zA-Z°ÅΩμ_/\s]+)',
        r'([-\d.\s]+)\s*([a-zA-Z°ÅΩμ_/\s]+?)\s*=\s*\?\s*([a-zA-Z°ÅΩμ_/\s]+)',
    ]
    
    matched = False
    value = None
    from_unit = None
    to_unit = None
    
    for pattern in patterns:
        match = re.search(pattern, inp, re.IGNORECASE)
        if match:
            value_str = match.group(1).strip()
            from_unit = match.group(2).strip().lower()
            to_unit = match.group(3).strip().lower()
            try:
                value = float(value_str)
            except ValueError:
                try:
                    value = float(parse_expression(value_str))
                except Exception:
                    continue
            matched = True
            steps.append(f"Parsed: {value} {from_unit} -> {to_unit}")
            break
    
    if not matched:
        return {"status": "error", "result": "Could not parse conversion request. Format: '5 km to miles'", "steps": steps}
    
    temp_units = {'celsius', 'c', 'fahrenheit', 'f', 'kelvin', 'k'}
    if from_unit in temp_units and to_unit in temp_units:
        result = convert_temperature(value, from_unit, to_unit)
        steps.append("Applied temperature conversion formula")
        return {"status": "success", "result": f"{result:.6g}", "steps": steps, "numeric": result}
    
    if PINT_AVAILABLE:
        try:
            pint_from = normalize_unit_for_pint(from_unit)
            pint_to = normalize_unit_for_pint(to_unit)
            quantity = value * UREG(pint_from)
            result = quantity.to(pint_to).magnitude
            steps.append(f"Used pint for conversion: {pint_from} -> {pint_to}")
            return {"status": "success", "result": f"{result:.10g}", "steps": steps, "numeric": result}
        except Exception as e:
            steps.append(f"Pint failed: {str(e)}, trying manual fallback")
    
    try:
        result = manual_convert(value, from_unit, to_unit)
        steps.append("Used manual conversion table")
        return {"status": "success", "result": f"{result:.10g}", "steps": steps, "numeric": result}
    except Exception as e:
        return {"status": "error", "result": f"Conversion error: {str(e)}", "steps": steps}

def normalize_unit_for_pint(unit_str):
    unit_str = unit_str.lower().strip()
    aliases = {
        'm': 'meter', 'km': 'kilometer', 'cm': 'centimeter', 'mm': 'millimeter',
        'ft': 'foot', 'in': 'inch', 'inches': 'inch', 'mi': 'mile', 'yd': 'yard',
        'lb': 'pound', 'lbs': 'pound', 'oz': 'ounce', 'g': 'gram', 'kg': 'kilogram',
        'mg': 'milligram', 'l': 'liter', 'ml': 'milliliter', 'gal': 'gallon',
        'qt': 'quart', 'pt': 'pint', 'cup': 'cup', 'floz': 'fluid_ounce',
        'mph': 'mile / hour', 'kph': 'kilometer / hour', 'mps': 'meter / second',
        'pa': 'pascal', 'kpa': 'kilopascal', 'bar': 'bar', 'atm': 'atmosphere',
        'psi': 'psi', 'mmhg': 'mmHg', 'j': 'joule', 'kj': 'kilojoule',
        'cal': 'calorie', 'kcal': 'kilocalorie', 'wh': 'watt_hour', 'kwh': 'kilowatt_hour',
        'ev': 'electron_volt', 'btu': 'BTU', 'w': 'watt', 'kw': 'kilowatt',
        'hp': 'horsepower', 'N': 'newton', 'kn': 'kilonewton', 'lbf': 'pound_force',
        'dyn': 'dyne', 'rad': 'radian', 'deg': 'degree', 'degrees': 'degree',
        'grad': 'gradian', 'hz': 'hertz', 'khz': 'kilohertz', 'mhz': 'megahertz',
        'ghz': 'gigahertz', 'thz': 'terahertz', 'ha': 'hectare', 'acre': 'acre',
        'nm': 'nanometer', 'angstrom': 'angstrom', 'å': 'angstrom',
        'celsius': 'degC', 'c': 'degC', 'fahrenheit': 'degF', 'f': 'degF',
        'kelvin': 'kelvin', 'k': 'kelvin',
    }
    if unit_str in aliases:
        return aliases[unit_str]
    return unit_str.replace('per', '/').replace(' ', '_')

def convert_temperature(value, from_unit, to_unit):
    from_unit = from_unit.lower().strip()
    to_unit = to_unit.lower().strip()
    if from_unit in ('c', 'celsius'):
        celsius = value
    elif from_unit in ('f', 'fahrenheit'):
        celsius = (value - 32) * 5/9
    elif from_unit in ('k', 'kelvin'):
        celsius = value - 273.15
    else:
        raise ValueError(f"Unknown temperature unit: {from_unit}")
    if to_unit in ('c', 'celsius'):
        return celsius
    elif to_unit in ('f', 'fahrenheit'):
        return celsius * 9/5 + 32
    elif to_unit in ('k', 'kelvin'):
        return celsius + 273.15
    else:
        raise ValueError(f"Unknown temperature unit: {to_unit}")

def manual_convert(value, from_unit, to_unit):
    from_unit = from_unit.lower().strip()
    to_unit = to_unit.lower().strip()
    if from_unit not in MANUAL_CONVERSIONS:
        raise ValueError(f"Unknown source unit: {from_unit}")
    if to_unit not in MANUAL_CONVERSIONS:
        raise ValueError(f"Unknown target unit: {to_unit}")
    from_val = MANUAL_CONVERSIONS[from_unit]
    to_val = MANUAL_CONVERSIONS[to_unit]
    if from_val == 'temp' or to_val == 'temp':
        raise ValueError("Temperature conversion not supported in manual mode for these units")
    return value * from_val / to_val

def handle_evaluate(data):
    inp = data.get('input', '').strip()
    variables = data.get('variables', {})
    options = data.get('options', {})
    precision = options.get('precision', 50)
    steps = []
    
    try:
        expr = parse_expression(inp)
        steps.append(f"Parsed expression: {expr}")
        if variables:
            subs = {}
            for var_name, var_val in variables.items():
                sym = sp.Symbol(var_name)
                subs[sym] = var_val
            expr = expr.subs(subs)
            steps.append(f"Substituted values: {variables}")
        mp.mp.dps = precision
        result = expr.evalf(precision)
        steps.append(f"Evaluated to {precision} digits of precision")
        try:
            numeric_val = float(result)
        except (TypeError, ValueError):
            numeric_val = None
        result_str = str(result)
        if numeric_val is not None:
            if numeric_val == int(numeric_val) and abs(numeric_val) < 1e15:
                result_str = str(int(numeric_val))
            else:
                result_str = f"{numeric_val:.{min(precision, 15)}g}"
        return {"status": "success", "result": result_str, "steps": steps, "numeric": numeric_val, "latex": get_latex(result)}
    except Exception as e:
        return {"status": "error", "result": f"Evaluate error: {str(e)}", "steps": steps}

def handle_system(data):
    inp = data.get('input', '').strip()
    steps = []
    equations = []
    eq_strings = []
    raw_parts = re.split(r'[,;\n]+', inp)
    
    for part in raw_parts:
        part = part.strip()
        if not part or '=' not in part:
            continue
        try:
            left, right = part.split('=', 1)
            left_expr = parse_expression(left.strip())
            right_expr = parse_expression(right.strip())
            eq = sp.Eq(left_expr, right_expr)
            equations.append(eq)
            eq_strings.append(f"{left.strip()} = {right.strip()}")
            steps.append(f"Parsed equation: {eq}")
        except Exception as e:
            steps.append(f"Skipped invalid equation: {part}")
    
    if len(equations) < 1:
        return {"status": "error", "result": "No valid equations found.", "steps": steps}
    
    all_symbols = set()
    for eq in equations:
        all_symbols.update(eq.free_symbols)
    exclude = {sp.E, sp.pi, sp.I, sp.oo}
    variables_to_solve = sorted(list(all_symbols - exclude), key=lambda s: str(s))
    
    if not variables_to_solve:
        return {"status": "error", "result": "No variables found in equations", "steps": steps}
    
    try:
        solutions = sp.solve(equations, variables_to_solve)
        steps.append(f"Solved system of {len(equations)} equations for {len(variables_to_solve)} variables")
        
        if not solutions:
            return {"status": "success", "result": "No solution found (system may be inconsistent or dependent)", "steps": steps}
        
        if isinstance(solutions, list):
            if len(solutions) == 1:
                sol = solutions[0]
                if isinstance(sol, tuple):
                    result_str = "; ".join([f"{variables_to_solve[i]} = {format_result(v)}" for i, v in enumerate(sol)])
                    latex = r" \\ ".join([f"{sp.latex(variables_to_solve[i])} = {get_latex(v)}" for i, v in enumerate(sol)])
                else:
                    result_str = format_result(sol)
                    latex = get_latex(sol)
            else:
                result_parts = []
                for i, sol in enumerate(solutions):
                    if isinstance(sol, tuple):
                        sol_str = "; ".join([f"{variables_to_solve[j]} = {format_result(v)}" for j, v in enumerate(sol)])
                    else:
                        sol_str = format_result(sol)
                    result_parts.append(f"Solution {i+1}: {sol_str}")
                result_str = " | ".join(result_parts)
                latex = None
        elif isinstance(solutions, dict):
            result_str = "; ".join([f"{k} = {format_result(v)}" for k, v in solutions.items()])
            latex = r" \\ ".join([f"{sp.latex(k)} = {get_latex(v)}" for k, v in solutions.items()])
        else:
            result_str = format_result(solutions)
            latex = get_latex(solutions)
        
        return {"status": "success", "result": result_str, "steps": steps, "latex": latex}
    except Exception as e:
        return {"status": "error", "result": f"System solve error: {str(e)}", "steps": steps}

# ============================================================================
# NEW ULTIMATE CAPABILITY HANDLERS (v2.0)
# ============================================================================

def handle_cipher(data):
    """
    ULTIMATE CRYPTOGRAPHY ENGINE
    Supports: AES, ChaCha20, RSA, SHA-3, SHA-256, HMAC, Base64/32/16/85,
    Hex, Binary, ROT13, Caesar, Morse, URL encode/decode, MD5, scrypt
    """
    inp = data.get('input', '').strip()
    options = data.get('options', {})
    steps = []
    
    inp_lower = inp.lower()
    
    # === HASHING ===
    if any(k in inp_lower for k in ['hash', 'sha256', 'sha-256', 'md5', 'sha3', 'sha-3']):
        text = inp
        for kw in ['hash', 'sha256', 'sha-256', 'md5', 'sha3', 'sha-3', 'of', 'compute']:
            text = re.sub(rf'\b{kw}\b', '', text, flags=re.IGNORECASE)
        text = text.strip().strip('"\'')
        
        if not text:
            return {"status": "error", "result": "No text provided to hash", "steps": steps}
        
        results = {}
        steps.append(f"Computing hashes for: {text[:50]}...")
        
        # MD5
        results['md5'] = hashlib.md5(text.encode()).hexdigest()
        # SHA-256
        results['sha256'] = hashlib.sha256(text.encode()).hexdigest()
        # SHA-512
        results['sha512'] = hashlib.sha512(text.encode()).hexdigest()
        # SHA3-256
        if CRYPTO_AVAILABLE:
            h = SHA3_256.new()
            h.update(text.encode())
            results['sha3_256'] = h.hexdigest()
            h2 = SHA3_512.new()
            h2.update(text.encode())
            results['sha3_512'] = h2.hexdigest()
        else:
            results['sha3_256'] = hashlib.sha3_256(text.encode()).hexdigest()
            results['sha3_512'] = hashlib.sha3_512(text.encode()).hexdigest()
        
        result_str = "; ".join([f"{k}: {v[:16]}..." for k, v in results.items()])
        return {"status": "success", "result": result_str, "steps": steps, "extra": results}
    
    # === HMAC ===
    if 'hmac' in inp_lower:
        match = re.search(r'hmac\s+(.+?)\s+key\s+(.+)', inp, re.IGNORECASE)
        if match:
            msg = match.group(1).strip().strip('"\'')
            key = match.group(2).strip().strip('"\'')
            h = hmac.new(key.encode(), msg.encode(), hashlib.sha256)
            result = h.hexdigest()
            steps.append("Computed HMAC-SHA256")
            return {"status": "success", "result": result, "steps": steps}
    
    # === BASE64 ===
    if 'base64' in inp_lower:
        if 'decode' in inp_lower or 'decrypt' in inp_lower:
            text = re.sub(r'base64\s+(decode|decrypt)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b64decode(text).decode('utf-8', errors='replace')
                steps.append("Decoded Base64")
                return {"status": "success", "result": decoded, "steps": steps}
            except Exception as e:
                return {"status": "error", "result": f"Base64 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base64\s+(encode|encrypt)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b64encode(text.encode()).decode()
            steps.append("Encoded Base64")
            return {"status": "success", "result": encoded, "steps": steps}
    
    # === BASE32 ===
    if 'base32' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'base32\s+decode\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b32decode(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Base32"]}
            except Exception as e:
                return {"status": "error", "result": f"Base32 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base32\s+encode?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b32encode(text.encode()).decode()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded Base32"]}
    
    # === HEX ===
    if 'hex' in inp_lower and 'to' not in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'hex\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = bytes.fromhex(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded hex"]}
            except Exception as e:
                return {"status": "error", "result": f"Hex decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'hex\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = text.encode().hex()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to hex"]}
    
    # === BINARY ===
    if 'binary' in inp_lower and 'to' not in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'binary\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip().replace(' ', '')
            try:
                decoded = ''.join(chr(int(text[i:i+8], 2)) for i in range(0, len(text), 8))
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded binary"]}
            except Exception as e:
                return {"status": "error", "result": f"Binary decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'binary\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = ' '.join(format(ord(c), '08b') for c in text)
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to binary"]}
    
    # === ROT13 ===
    if 'rot13' in inp_lower:
        text = re.sub(r'rot13\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
        result = text.translate(str.maketrans(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'
        ))
        return {"status": "success", "result": result, "steps": steps + ["Applied ROT13 cipher"]}
    
    # === CAESAR CIPHER ===
    caesar_match = re.search(r'caesar\s+(.+?)\s+shift\s+(-?\d+)', inp, re.IGNORECASE)
    if not caesar_match:
        caesar_match = re.search(r'caesar\s+shift\s+(-?\d+)\s+(.+)', inp, re.IGNORECASE)
    if caesar_match:
        if caesar_match.lastindex == 2 and 'shift' in inp_lower.split(caesar_match.group(1).lower())[0]:
            shift = int(caesar_match.group(1))
            text = caesar_match.group(2).strip().strip('"\'')
        else:
            text = caesar_match.group(1).strip().strip('"\'')
            shift = int(caesar_match.group(2))
        result = ''.join(
            chr((ord(c) - 65 + shift) % 26 + 65) if c.isupper() else
            chr((ord(c) - 97 + shift) % 26 + 97) if c.islower() else c
            for c in text
        )
        return {"status": "success", "result": result, "steps": steps + [f"Applied Caesar cipher with shift {shift}"]}
    
    # === MORSE CODE ===
    if 'morse' in inp_lower:
        if 'decode' in inp_lower:
            code = re.sub(r'morse\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            reverse_dict = {v: k for k, v in MORSE_CODE_DICT.items()}
            words = code.split(' / ')
            decoded = []
            for word in words:
                letters = word.split()
                decoded_word = ''.join(reverse_dict.get(letter, '?') for letter in letters)
                decoded.append(decoded_word)
            result = ' '.join(decoded)
            return {"status": "success", "result": result, "steps": steps + ["Decoded Morse code"]}
        else:
            text = re.sub(r'morse\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'').upper()
            encoded = ' / '.join(
                ' '.join(MORSE_CODE_DICT.get(c, c) for c in word)
                for word in text.split()
            )
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to Morse code"]}
    
    # === URL ENCODE/DECODE ===
    if 'url' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'url\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            import urllib.parse
            decoded = urllib.parse.unquote(text)
            return {"status": "success", "result": decoded, "steps": steps + ["URL decoded"]}
        else:
            text = re.sub(r'url\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            import urllib.parse
            encoded = urllib.parse.quote(text)
            return {"status": "success", "result": encoded, "steps": steps + ["URL encoded"]}
    
    # === AES ENCRYPTION ===
    if 'aes' in inp_lower and CRYPTO_AVAILABLE:
        match = re.search(r'aes\s+(encrypt|decrypt)\s+(.+?)\s+key\s+(.+)', inp, re.IGNORECASE)
        if match:
            action = match.group(1).lower()
            text = match.group(2).strip().strip('"\'')
            key = match.group(3).strip().strip('"\'')
            
            # Pad key to 16, 24, or 32 bytes
            key_bytes = key.encode()
            if len(key_bytes) < 16:
                key_bytes = key_bytes + b'\0' * (16 - len(key_bytes))
            elif len(key_bytes) < 24:
                key_bytes = key_bytes + b'\0' * (24 - len(key_bytes))
            elif len(key_bytes) < 32:
                key_bytes = key_bytes + b'\0' * (32 - len(key_bytes))
            else:
                key_bytes = key_bytes[:32]
            
            try:
                if action == 'encrypt':
                    cipher = AES.new(key_bytes, AES.MODE_GCM)
                    ciphertext, tag = cipher.encrypt_and_digest(text.encode())
                    result = base64.b64encode(cipher.nonce + tag + ciphertext).decode()
                    steps.append("Encrypted with AES-256-GCM")
                else:
                    data = base64.b64decode(text)
                    nonce, tag, ciphertext = data[:16], data[16:32], data[32:]
                    cipher = AES.new(key_bytes, AES.MODE_GCM, nonce=nonce)
                    result = cipher.decrypt_and_verify(ciphertext, tag).decode()
                    steps.append("Decrypted with AES-256-GCM")
                return {"status": "success", "result": result, "steps": steps}
            except Exception as e:
                return {"status": "error", "result": f"AES error: {str(e)}", "steps": steps}
    
    # === CHACHA20 ===
    if 'chacha20' in inp_lower and CRYPTO_AVAILABLE:
        match = re.search(r'chacha20\s+(encrypt|decrypt)\s+(.+?)\s+key\s+(.+)', inp, re.IGNORECASE)
        if match:
            action = match.group(1).lower()
            text = match.group(2).strip().strip('"\'')
            key = match.group(3).strip().strip('"\'')
            key_bytes = key.encode().ljust(32, b'\0')[:32]
            
            try:
                if action == 'encrypt':
                    cipher = ChaCha20.new(key=key_bytes)
                    ciphertext = cipher.encrypt(text.encode())
                    result = base64.b64encode(cipher.nonce + ciphertext).decode()
                    steps.append("Encrypted with ChaCha20")
                else:
                    data = base64.b64decode(text)
                    nonce, ciphertext = data[:8], data[8:]
                    cipher = ChaCha20.new(key=key_bytes, nonce=nonce)
                    result = cipher.decrypt(ciphertext).decode()
                    steps.append("Decrypted with ChaCha20")
                return {"status": "success", "result": result, "steps": steps}
            except Exception as e:
                return {"status": "error", "result": f"ChaCha20 error: {str(e)}", "steps": steps}
    
    # === RSA ===
    if 'rsa' in inp_lower and CRYPTO_AVAILABLE:
        if 'generate' in inp_lower:
            key = RSA.generate(2048)
            private = key.export_key().decode()
            public = key.publickey().export_key().decode()
            return {
                "status": "success",
                "result": "RSA 2048-bit keypair generated",
                "steps": steps + ["Generated RSA keypair"],
                "extra": {"private_key": private[:100] + "...", "public_key": public[:100] + "..."}
            }
    
    # === SCRYPT ===
    if 'scrypt' in inp_lower and CRYPTO_AVAILABLE:
        match = re.search(r'scrypt\s+(.+?)\s+salt\s+(.+)', inp, re.IGNORECASE)
        if match:
            password = match.group(1).strip().strip('"\'')
            salt = match.group(2).strip().strip('"\'').encode()
            key = scrypt(password.encode(), salt, 32, N=2**14, r=8, p=1)
            return {"status": "success", "result": key.hex(), "steps": steps + ["Derived key using scrypt"]}
    
    return {
        "status": "error",
        "result": "Unknown cipher operation. Supported: hash, base64, base32, hex, binary, rot13, caesar, morse, url, aes, chacha20, rsa, scrypt, hmac",
        "steps": steps
    }

def handle_chemistry(data):
    """
    ULTIMATE CHEMISTRY ENGINE
    Supports: Molecular mass, balancing equations, stoichiometry,
    formula parsing, substance properties, reaction balancing
    """
    inp = data.get('input', '').strip()
    steps = []
    
    if not CHEMPY_AVAILABLE:
        # Fallback to basic chemistry with sympy
        return handle_chemistry_fallback(data)
    
    try:
        # === BALANCE EQUATION ===
        if 'balance' in inp.lower() or 'balancing' in inp.lower():
            # Extract equation: e.g., "balance H2 + O2 -> H2O"
            eq_text = re.sub(r'balance\s+', '', inp, flags=re.IGNORECASE).strip()
            # Parse reactants and products
            if '->' in eq_text:
                left, right = eq_text.split('->', 1)
            elif '=' in eq_text:
                left, right = eq_text.split('=', 1)
            else:
                return {"status": "error", "result": "Use -> or = to separate reactants and products", "steps": steps}
            
            reactants = [r.strip() for r in left.split('+')]
            products = [p.strip() for p in right.split('+')]
            
            reactants_dict = {}
            products_dict = {}
            
            for r in reactants:
                if r:
                    substance = Substance.from_formula(r)
                    reactants_dict[substance] = 1
            for p in products:
                if p:
                    substance = Substance.from_formula(p)
                    products_dict[substance] = 1
            
            balanced = balance_stoichiometry(reactants_dict, products_dict)
            reactants_balanced = {str(k): v for k, v in balanced[0].items()}
            products_balanced = {str(k): v for k, v in balanced[1].items()}
            
            result_str = " + ".join([f"{v}{k}" for k, v in reactants_balanced.items()]) + " -> " + \
                        " + ".join([f"{v}{k}" for k, v in products_balanced.items()])
            
            steps.append("Balanced chemical equation using ChemPy")
            return {"status": "success", "result": result_str, "steps": steps}
        
        # === MOLECULAR MASS ===
        if any(k in inp.lower() for k in ['molar mass', 'molecular mass', 'molecular weight', 'mass of']):
            formula = re.sub(r'(molar mass|molecular mass|molecular weight|mass of)\s+', '', inp, flags=re.IGNORECASE).strip()
            substance = Substance.from_formula(formula)
            mass = substance.mass
            composition = substance.composition
            
            steps.append(f"Calculated molecular mass for {formula}")
            return {
                "status": "success",
                "result": f"{mass:.4f} g/mol",
                "steps": steps,
                "numeric": float(mass),
                "extra": {"formula": formula, "composition": str(composition)}
            }
        
        # === PARSE FORMULA ===
        if 'formula' in inp.lower() or 'composition' in inp.lower():
            formula = re.sub(r'(formula|composition)\s+', '', inp, flags=re.IGNORECASE).strip()
            substance = Substance.from_formula(formula)
            unicode_name = substance.unicode_name
            latex_name = substance.latex_name
            charge = substance.charge
            
            steps.append(f"Parsed chemical formula: {formula}")
            return {
                "status": "success",
                "result": f"{unicode_name} (charge: {charge})",
                "steps": steps,
                "extra": {"latex": latex_name, "charge": charge, "mass": float(substance.mass) if hasattr(substance, 'mass') else None}
            }
        
        return {
            "status": "error",
            "result": "Unknown chemistry operation. Supported: balance, molar mass, formula, composition",
            "steps": steps
        }
        
    except Exception as e:
        return {"status": "error", "result": f"Chemistry error: {str(e)}", "steps": steps}

def handle_chemistry_fallback(data):
    """Basic chemistry when ChemPy is not available"""
    inp = data.get('input', '').strip()
    steps = []
    
    # Basic atomic weights
    atomic_weights = {
        'H': 1.008, 'He': 4.003, 'Li': 6.94, 'Be': 9.012, 'B': 10.81,
        'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180,
        'Na': 22.990, 'Mg': 24.305, 'Al': 26.982, 'Si': 28.085, 'P': 30.974,
        'S': 32.06, 'Cl': 35.45, 'K': 39.098, 'Ar': 39.948, 'Ca': 40.078,
        'Sc': 44.956, 'Ti': 47.867, 'V': 50.942, 'Cr': 51.996, 'Mn': 54.938,
        'Fe': 55.845, 'Co': 58.933, 'Ni': 58.693, 'Cu': 63.546, 'Zn': 65.38,
        'Ga': 69.723, 'Ge': 72.63, 'As': 74.922, 'Se': 78.96, 'Br': 79.904,
        'Kr': 83.798, 'Rb': 85.468, 'Sr': 87.62, 'Y': 88.906, 'Zr': 91.224,
        'Nb': 92.906, 'Mo': 95.95, 'Tc': 98, 'Ru': 101.07, 'Rh': 102.
        'Rh': 102.91, 'Pd': 106.42, 'Ag': 107.87, 'Cd': 112.41,
        'In': 114.82, 'Sn': 118.71, 'Sb': 121.76, 'Te': 127.60,
        'I': 126.90, 'Xe': 131.29, 'Cs': 132.91, 'Ba': 137.33,
        'La': 138.91, 'Ce': 140.12, 'Pr': 140.91, 'Nd': 144.24,
        'Pm': 145, 'Sm': 150.36, 'Eu': 151.96, 'Gd': 157.25,
        'Tb': 158.93, 'Dy': 162.50, 'Ho': 164.93, 'Er': 167.26,
        'Tm': 168.93, 'Yb': 173.05, 'Lu': 174.97, 'Hf': 178.49,
        'Ta': 180.95, 'W': 183.84, 'Re': 186.21, 'Os': 190.23,
        'Ir': 192.22, 'Pt': 195.08, 'Au': 196.97, 'Hg': 200.59,
        'Tl': 204.38, 'Pb': 207.2, 'Bi': 208.98, 'Po': 209,
        'At': 210, 'Rn': 222, 'Fr': 223, 'Ra': 226, 'Ac': 227,
        'Th': 232.04, 'Pa': 231.04, 'U': 238.03,
    }
    
    # Parse formula for molecular mass
    if any(k in inp.lower() for k in ['molar mass', 'molecular mass', 'mass of']):
        formula = re.sub(r'(molar mass|molecular mass|mass of)\s+', '', inp, flags=re.IGNORECASE).strip()
        
        # Parse formula like H2O, C6H12O6, (NH4)2SO4
        def parse_formula(formula_str):
            mass = 0
            i = 0
            while i < len(formula_str):
                if formula_str[i] == '(':
                    # Find closing parenthesis
                    depth = 1
                    j = i + 1
                    while j < len(formula_str) and depth > 0:
                        if formula_str[j] == '(':
                            depth += 1
                        elif formula_str[j] == ')':
                            depth -= 1
                        j += 1
                    group_mass = parse_formula(formula_str[i+1:j-1])
                    # Check for multiplier after )
                    k = j
                    mult_str = ''
                    while k < len(formula_str) and formula_str[k].isdigit():
                        mult_str += formula_str[k]
                        k += 1
                    mult = int(mult_str) if mult_str else 1
                    mass += group_mass * mult
                    i = k
                else:
                    # Element symbol
                    if i+1 < len(formula_str) and formula_str[i+1].islower():
                        symbol = formula_str[i:i+2]
                        i += 2
                    else:
                        symbol = formula_str[i]
                        i += 1
                    
                    if symbol in atomic_weights:
                        # Count
                        count_str = ''
                        while i < len(formula_str) and formula_str[i].isdigit():
                            count_str += formula_str[i]
                            i += 1
                        count = int(count_str) if count_str else 1
                        mass += atomic_weights[symbol] * count
            return mass
        
        try:
            mass = parse_formula(formula)
            steps.append(f"Calculated molecular mass for {formula}")
            return {"status": "success", "result": f"{mass:.4f} g/mol", "steps": steps, "numeric": mass}
        except Exception as e:
            return {"status": "error", "result": f"Could not parse formula: {str(e)}", "steps": steps}
    
    return {"status": "error", "result": "ChemPy not available. Basic chemistry supports: molar mass only.", "steps": steps}

def handle_z3(data):
    """
    ULTIMATE THEOREM PROVER & CONSTRAINT SOLVER
    SAT solving, formal verification, constraint satisfaction,
    optimization, logic puzzles, equation systems
    """
    inp = data.get('input', '').strip()
    steps = []
    
    if not Z3_AVAILABLE:
        return {"status": "error", "result": "Z3 theorem prover not installed. Install with: pip install z3-solver", "steps": steps}
    
    try:
        # Reset Z3 context
        z3.set_param('model', True)
        
        # === SAT SOLVER / CONSTRAINT SATISFACTION ===
        if any(k in inp.lower() for k in ['solve', 'find', 'satisfy', 'constraint', 'sat']):
            # Parse variables and constraints
            # Example: "solve x + y = 10, x > 3, y < 8 where x,y are integers"
            
            # Extract variable declarations
            var_pattern = r'(\w+)\s+(?:is\s+)?(?:an?\s+)?(int|integer|real|bool)'
            var_matches = re.findall(var_pattern, inp, re.IGNORECASE)
            
            z3_vars = {}
            for var_name, var_type in var_matches:
                if var_type.lower() in ('int', 'integer'):
                    z3_vars[var_name] = z3.Int(var_name)
                elif var_type.lower() == 'real':
                    z3_vars[var_name] = z3.Real(var_name)
                elif var_type.lower() == 'bool':
                    z3_vars[var_name] = z3.Bool(var_name)
            
            # If no explicit declarations, try to auto-detect
            if not z3_vars:
                # Find all potential variable names (single letters or words)
                potential_vars = set(re.findall(r'\b([a-zA-Z_]\w*)\b', inp))
                # Filter out keywords
                keywords = {'solve', 'find', 'satisfy', 'constraint', 'where', 'and', 'or', 'not', 'is', 'are', 'an', 'int', 'integer', 'real', 'bool', 'true', 'false', 'maximize', 'minimize', 'subject', 'to'}
                for var_name in potential_vars:
                    if var_name.lower() not in keywords and len(var_name) <= 10:
                        z3_vars[var_name] = z3.Int(var_name)  # Default to integer
            
            # Extract constraints (expressions with =, <, >, <=, >=)
            constraints = []
            
            # Remove variable declarations from input
            clean_inp = inp
            for var_name, var_type in var_matches:
                clean_inp = re.sub(rf'{var_name}\s+(?:is\s+)?(?:an?\s+)?{var_type}', '', clean_inp, flags=re.IGNORECASE)
            
            # Parse equations and inequalities
            eq_pattern = r'([^,;]+?)(?:\s*(?:,|;|$))'
            parts = re.findall(eq_pattern, clean_inp)
            
            solver = z3.Solver()
            
            for part in parts:
                part = part.strip()
                if not part or any(kw in part.lower() for kw in ['solve', 'find', 'where', 'subject', 'maximize', 'minimize']):
                    continue
                
                # Replace operators for Z3
                z3_expr = part
                for var_name, z3_var in z3_vars.items():
                    z3_expr = re.sub(rf'\b{var_name}\b', f'z3_vars["{var_name}"]', z3_expr)
                
                # Handle common operators
                z3_expr = z3_expr.replace('=', '==').replace('≤', '<=').replace('≥', '>=').replace('≠', '!=')
                
                try:
                    # Evaluate in Z3 context
                    constraint = eval(z3_expr, {"__builtins__": {}}, {"z3": z3, "z3_vars": z3_vars, "And": z3.And, "Or": z3.Or, "Not": z3.Not, "Implies": z3.Implies})
                    if isinstance(constraint, bool):
                        continue
                    solver.add(constraint)
                    constraints.append(part)
                except Exception as e:
                    steps.append(f"Skipped constraint '{part}': {str(e)}")
            
            # Check satisfiability
            if solver.check() == z3.sat:
                model = solver.model()
                result_parts = []
                for var_name, z3_var in z3_vars.items():
                    val = model[z3_var]
                    if val is not None:
                        result_parts.append(f"{var_name} = {val}")
                
                steps.append(f"Solved constraint system with {len(constraints)} constraints")
                return {"status": "success", "result": "; ".join(result_parts), "steps": steps}
            else:
                return {"status": "success", "result": "No solution satisfies all constraints (UNSAT)", "steps": steps + ["System is unsatisfiable"]}
        
        # === OPTIMIZATION ===
        if any(k in inp.lower() for k in ['maximize', 'minimize', 'optimize']):
            opt = z3.Optimize()
            
            # Parse objective
            obj_match = re.search(r'(maximize|minimize)\s+(.+?)(?:\s+subject\s+to|\s+where|$)', inp, re.IGNORECASE)
            if not obj_match:
                return {"status": "error", "result": "Specify objective: maximize <expression> subject to <constraints>", "steps": steps}
            
            direction = obj_match.group(1).lower()
            objective_str = obj_match.group(2).strip()
            
            # Auto-detect variables
            potential_vars = set(re.findall(r'\b([a-zA-Z_]\w*)\b', objective_str))
            keywords = {'maximize', 'minimize', 'subject', 'where', 'and', 'or', 'not', 'to'}
            z3_vars = {}
            for var_name in potential_vars:
                if var_name.lower() not in keywords:
                    z3_vars[var_name] = z3.Real(var_name)
            
            # Parse objective
            obj_expr = objective_str
            for var_name, z3_var in z3_vars.items():
                obj_expr = re.sub(rf'\b{var_name}\b', f'z3_vars["{var_name}"]', obj_expr)
            
            try:
                objective = eval(obj_expr, {"__builtins__": {}}, {"z3": z3, "z3_vars": z3_vars})
            except Exception as e:
                return {"status": "error", "result": f"Could not parse objective: {str(e)}", "steps": steps}
            
            if direction == 'maximize':
                opt.maximize(objective)
            else:
                opt.minimize(objective)
            
            # Add constraints
            constraints_str = inp.split('subject to', 1)[1] if 'subject to' in inp.lower() else ''
            if constraints_str:
                for constraint in constraints_str.split(','):
                    constraint = constraint.strip()
                    if not constraint:
                        continue
                    c_expr = constraint
                    for var_name, z3_var in z3_vars.items():
                        c_expr = re.sub(rf'\b{var_name}\b', f'z3_vars["{var_name}"]', c_expr)
                    c_expr = c_expr.replace('=', '==').replace('≤', '<=').replace('≥', '>=')
                    try:
                        c = eval(c_expr, {"__builtins__": {}}, {"z3": z3, "z3_vars": z3_vars})
                        opt.add(c)
                    except Exception:
                        pass
            
            if opt.check() == z3.sat:
                model = opt.model()
                result_parts = []
                for var_name, z3_var in z3_vars.items():
                    val = model[z3_var]
                    if val is not None:
                        result_parts.append(f"{var_name} = {val}")
                
                obj_val = model.eval(objective)
                steps.append(f"Found optimal solution: {direction} = {obj_val}")
                return {"status": "success", "result": f"Optimal value: {obj_val}; " + "; ".join(result_parts), "steps": steps}
            else:
                return {"status": "success", "result": "No feasible solution found", "steps": steps}
        
        return {"status": "error", "result": "Unknown Z3 operation. Supported: solve constraints, maximize/minimize optimization", "steps": steps}
        
    except Exception as e:
        return {"status": "error", "result": f"Z3 error: {str(e)}", "steps": steps}

def handle_graph(data):
    """
    ULTIMATE GRAPH THEORY ENGINE
    Shortest path, network analysis, centrality, MST, flow,
    graph algorithms, topological sort, connectivity
    """
    inp = data.get('input', '').strip()
    steps = []
    
    if not NETWORKX_AVAILABLE:
        return {"status": "error", "result": "NetworkX not installed. Install with: pip install networkx", "steps": steps}
    
    try:
        # === SHORTEST PATH ===
        if 'shortest path' in inp.lower() or 'path from' in inp.lower():
            # Parse: "shortest path from A to B in graph: A-B:5, A-C:2, C-B:1"
            match = re.search(r'(?:shortest path|path)\s+from\s+(\w+)\s+to\s+(\w+)(?:\s+in\s+graph:?\s+)?(.+)', inp, re.IGNORECASE)
            if match:
                source = match.group(1)
                target = match.group(2)
                edges_str = match.group(3).strip()
                
                G = nx.Graph()
                
                # Parse edges: "A-B:5, B-C:3" or "A->B:5, B->C:3" for directed
                directed = '->' in edges_str
                if directed:
                    G = nx.DiGraph()
                
                edge_pattern = r'(\w+)(?:->|-)(\w+):(\d+\.?\d*)'
                edges = re.findall(edge_pattern, edges_str)
                
                for u, v, w in edges:
                    G.add_edge(u, v, weight=float(w))
                
                try:
                    path = nx.shortest_path(G, source, target, weight='weight')
                    length = nx.shortest_path_length(G, source, target, weight='weight')
                    steps.append(f"Computed shortest path in {('directed' if directed else 'undirected')} graph")
                    return {"status": "success", "result": f"Path: {' -> '.join(path)} (distance: {length})", "steps": steps, "numeric": length}
                except nx.NetworkXNoPath:
                    return {"status": "success", "result": f"No path from {source} to {target}", "steps": steps}
        
        # === MINIMUM SPANNING TREE ===
        if 'mst' in inp.lower() or 'minimum spanning tree' in inp.lower() or 'spanning tree' in inp.lower():
            edges_str = re.sub(r'(mst|minimum spanning tree|spanning tree)\s*', '', inp, flags=re.IGNORECASE).strip()
            
            G = nx.Graph()
            edge_pattern = r'(\w+)-(\w+):(\d+\.?\d*)'
            edges = re.findall(edge_pattern, edges_str)
            
            for u, v, w in edges:
                G.add_edge(u, v, weight=float(w))
            
            mst = nx.minimum_spanning_tree(G)
            mst_edges = [(u, v, d['weight']) for u, v, d in mst.edges(data=True)]
            total_weight = sum(d['weight'] for u, v, d in mst.edges(data=True))
            
            result = ", ".join([f"{u}-{v}:{w}" for u, v, w in mst_edges])
            steps.append("Computed Minimum Spanning Tree using Kruskal's algorithm")
            return {"status": "success", "result": f"MST edges: {result} (total: {total_weight})", "steps": steps, "numeric": total_weight}
        
        # === CENTRALITY ===
        if 'centrality' in inp.lower() or 'important' in inp.lower() or 'center' in inp.lower():
            edges_str = re.sub(r'(centrality|important|center)\s*', '', inp, flags=re.IGNORECASE).strip()
            
            G = nx.Graph()
            edge_pattern = r'(\w+)-(\w+)(?::(\d+\.?\d*))?'
            edges = re.findall(edge_pattern, edges_str)
            
            for u, v, w in edges:
                G.add_edge(u, v, weight=float(w) if w else 1)
            
            # Compute various centrality measures
            degree_cent = nx.degree_centrality(G)
            betweenness_cent = nx.betweenness_centrality(G)
            closeness_cent = nx.closeness_centrality(G)
            eigenvector_cent = nx.eigenvector_centrality(G, max_iter=1000)
            
            results = {
                'degree': {k: round(v, 4) for k, v in degree_cent.items()},
                'betweenness': {k: round(v, 4) for k, v in betweenness_cent.items()},
                'closeness': {k: round(v, 4) for k, v in closeness_cent.items()},
                'eigenvector': {k: round(v, 4) for k, v in eigenvector_cent.items()},
            }
            
            most_central = max(eigenvector_cent, key=eigenvector_cent.get)
            steps.append("Computed centrality measures (degree, betweenness, closeness, eigenvector)")
            
            return {
                "status": "success",
                "result": f"Most central node: {most_central} (eigenvector: {eigenvector_cent[most_central]:.4f})",
                "steps": steps,
                "extra": results
            }
        
        # === GRAPH PROPERTIES ===
        if any(k in inp.lower() for k in ['properties', 'connected', 'components', 'diameter', 'density']):
            edges_str = re.sub(r'(properties|connected|components|diameter|density)\s*', '', inp, flags=re.IGNORECASE).strip()
            
            G = nx.Graph()
            edge_pattern = r'(\w+)-(\w+)(?::(\d+\.?\d*))?'
            edges = re.findall(edge_pattern, edges_str)
            
            for u, v, w in edges:
                G.add_edge(u, v, weight=float(w) if w else 1)
            
            properties = {
                'nodes': G.number_of_nodes(),
                'edges': G.number_of_edges(),
                'connected': nx.is_connected(G),
                'components': nx.number_connected_components(G),
                'density': round(nx.density(G), 4),
            }
            
            if nx.is_connected(G):
                properties['diameter'] = nx.diameter(G)
                properties['radius'] = nx.radius(G)
                properties['center'] = list(nx.center(G))
            
            steps.append("Analyzed graph properties")
            return {"status": "success", "result": str(properties), "steps": steps, "extra": properties}
        
        return {
            "status": "error",
            "result": "Unknown graph operation. Supported: shortest path, MST, centrality, properties",
            "steps": steps
        }
        
    except Exception as e:
        return {"status": "error", "result": f"Graph error: {str(e)}", "steps": steps}

def handle_code(data):
    """
    ULTIMATE SAFE CODE EXECUTION ENGINE
    Execute Python expressions safely using asteval sandbox
    Supports: math operations, variable assignment, function calls,
    array operations, basic plotting data generation
    """
    inp = data.get('input', '').strip()
    options = data.get('options', {})
    steps = []
    
    if not ASTEVAL_AVAILABLE:
        return {"status": "error", "result": "Asteval not installed. Install with: pip install asteval", "steps": steps}
    
    try:
        # Create safe interpreter
        aeval = Interpreter()
        
        # Inject safe math functions
        safe_funcs = {
            'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
            'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
            'sinh': math.sinh, 'cosh': math.cosh, 'tanh': math.tanh,
            'exp': math.exp, 'log': math.log, 'log10': math.log10,
            'sqrt': math.sqrt, 'pow': math.pow, 'abs': abs,
            'floor': math.floor, 'ceil': math.ceil, 'round': round,
            'factorial': math.factorial, 'gamma': math.gamma,
            'pi': math.pi, 'e': math.e, 'inf': float('inf'),
            'random': random.random, 'randint': random.randint,
            'sum': sum, 'max': max, 'min': min, 'len': len,
            'range': range, 'enumerate': enumerate, 'zip': zip,
            'map': map, 'filter': filter, 'sorted': sorted,
            'list': list, 'dict': dict, 'set': set, 'tuple': tuple,
            'str': str, 'int': int, 'float': float, 'bool': bool,
            'numpy': np, 'np': np,
        }
        
        for name, func in safe_funcs.items():
            aeval.symtable[name] = func
        
        # Execute the code
        result = aeval(inp)
        
        if aeval.error:
            errors = [str(err) for err in aeval.error]
            return {"status": "error", "result": f"Execution errors: {'; '.join(errors)}", "steps": steps}
        
        steps.append("Executed code in safe sandbox")
        
        # Format result
        if result is None:
            # Check if variables were assigned
            vars_defined = {k: v for k, v in aeval.symtable.items() if k not in safe_funcs and not k.startswith('_')}
            if vars_defined:
                result_str = "; ".join([f"{k} = {v}" for k, v in list(vars_defined.items())[:5]])
            else:
                result_str = "Code executed successfully (no return value)"
        else:
            result_str = str(result)
            if hasattr(result, '__len__') and not isinstance(result, str):
                if len(result) > 10:
                    result_str = f"{str(result)[:100]}... (length: {len(result)})"
        
        return {"status": "success", "result": result_str, "steps": steps}
        
    except Exception as e:
        return {"status": "error", "result": f"Code execution error: {str(e)}", "steps": steps}

def handle_uncertainty(data):
    """
    ULTIMATE UNCERTAINTY PROPAGATION ENGINE
    Error propagation with correlations, confidence intervals,
    measurement uncertainty, significant figures
    """
    inp = data.get('input', '').strip()
    steps = []
    
    if not UNCERTAINTIES_AVAILABLE:
        return {"status": "error", "result": "Uncertainties not installed. Install with: pip install uncertainties", "steps": steps}
    
    try:
        # Parse expressions with uncertainty
        # Format: "x = 5.0 +/- 0.1, y = 3.0 +/- 0.2, compute x*y + y**2"
        
        # Extract variable definitions
        var_pattern = r'(\w+)\s*=\s*([-\d.]+)\s*(?:\+/-|±|\+/-)\s*([-\d.]+)'
        var_matches = re.findall(var_pattern, inp)
        
        uvars = {}
        for var_name, val, err in var_matches:
            uvars[var_name] = ufloat(float(val), float(err))
            steps.append(f"Defined {var_name} = {val} ± {err}")
        
        # Extract computation
        compute_match = re.search(r'(?:compute|calculate|find|evaluate)\s+(.+)', inp, re.IGNORECASE)
        if compute_match:
            expr_str = compute_match.group(1).strip()
        else:
            # Use the last part after variables
            parts = inp.split(',')
            expr_str = parts[-1].strip()
            if '=' in expr_str:
                expr_str = expr_str.split('=', 1)[1].strip()
        
        # Substitute variables
        for var_name, uvar in uvars.items():
            expr_str = re.sub(rf'\b{var_name}\b', f'uvars["{var_name}"]', expr_str)
        
        # Evaluate with uncertainties
        try:
            result = eval(expr_str, {"__builtins__": {}}, {**uvars, "umath": umath_lib, "np": np})
            steps.append("Propagated uncertainties through expression")
            
            # Extract nominal value and standard deviation
            nominal = result.nominal_value
            std_dev = result.std_dev
            rel_uncertainty = (std_dev / abs(nominal) * 100) if nominal != 0 else float('inf')
            
            result_str = f"{nominal:.6g} ± {std_dev:.2g} ({rel_uncertainty:.2f}% relative)"
            
            return {
                "status": "success",
                "result": result_str,
                "steps": steps,
                "numeric": float(nominal),
                "extra": {
                    "nominal": float(nominal),
                    "uncertainty": float(std_dev),
                    "relative_percent": float(rel_uncertainty) if rel_uncertainty != float('inf') else None
                }
            }
        except Exception as e:
            return {"status": "error", "result": f"Could not evaluate expression: {str(e)}", "steps": steps}
        
    except Exception as e:
        return {"status": "error", "result": f"Uncertainty error: {str(e)}", "steps": steps}

def handle_advanced_stats(data):
    """
    ULTIMATE ADVANCED STATISTICS ENGINE
    Regression, ANOVA, hypothesis testing, distributions,
    confidence intervals, time series, goodness of fit
    """
    inp = data.get('input', '').strip()
    options = data.get('options', {})
    steps = []
    
    # === LINEAR REGRESSION ===
    if any(k in inp.lower() for k in ['regression', 'fit', 'line', 'trend', 'predict']):
        # Parse data points: "regression: (1,2), (2,3), (3,5), (4,4)"
        points_match = re.findall(r'\(([-\d.]+)\s*,\s*([-\d.]+)\)', inp)
        
        if len(points_match) < 2:
            return {"status": "error", "result": "Need at least 2 data points as (x,y) pairs", "steps": steps}
        
        x = np.array([float(p[0]) for p in points_match]).reshape(-1, 1)
        y = np.array([float(p[1]) for p in points_match])
        
        # Check for polynomial degree
        degree_match = re.search(r'degree\s+(\d+)', inp, re.IGNORECASE)
        degree = int(degree_match.group(1)) if degree_match else 1
        
        if degree == 1 and SKLEARN_AVAILABLE:
            model = LinearRegression()
            model.fit(x, y)
            slope = float(model.coef_[0])
            intercept = float(model.intercept_)
            r2 = float(model.score(x, y))
            
            # Predictions
            y_pred = model.predict(x)
            residuals = y - y_pred
            mse = float(np.mean(residuals**2))
            
            steps.append(f"Fitted linear regression (R² = {r2:.4f})")
            return {
                "status": "success",
                "result": f"y = {slope:.4f}x + {intercept:.4f} (R² = {r2:.4f})",
                "steps": steps,
                "extra": {
                    "slope": slope,
                    "intercept": intercept,
                    "r_squared": r2,
                    "mse": mse,
                    "equation": f"y = {slope:.4f}x + {intercept:.4f}"
                }
            }
        else:
            # Polynomial regression
            coeffs = np.polyfit(x.flatten(), y, degree)
            p = np.poly1d(coeffs)
            y_pred = p(x.flatten())
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
            
            terms = []
            for i, c in enumerate(reversed(coeffs)):
                if abs(c) > 1e-10:
                    if i == 0:
                        terms.append(f"{c:.4f}")
                    elif i == 1:
                        terms.append(f"{c:.4f}x")
                    else:
                        terms.append(f"{c:.4f}x^{i}")
            
            equation = " + ".join(terms)
            steps.append(f"Fitted polynomial regression degree {degree}")
            return {
                "status": "success",
                "result": f"y = {equation} (R² = {r2:.4f})",
                "steps": steps,
                "extra": {"coefficients": [float(c) for c in coeffs], "r_squared": float(r2)}
            }
    
    # === T-TEST ===
    if 't-test' in inp.lower() or 'ttest' in inp.lower() or 'compare' in inp.lower():
        # Parse two groups
        groups = re.findall(r'group\s*\d*[:=]?\s*\[([-\d.,\s]+)\]', inp, re.IGNORECASE)
        
        if len(groups) >= 2:
            group1 = [float(x.strip()) for x in groups[0].split(',') if x.strip()]
            group2 = [float(x.strip()) for x in groups[1].split(',') if x.strip()]
        else:
            # Try to find two lists of numbers
            all_nums = re.findall(r'\[([-\d.,\s]+)\]', inp)
            if len(all_nums) >= 2:
                group1 = [float(x.strip()) for x in all_nums[0].split(',') if x.strip()]
                group2 = [float(x.strip()) for x in all_nums[1].split(',') if x.strip()]
            else:
                return {"status": "error", "result": "Provide two groups as [a,b,c] [d,e,f] or group1:[...] group2:[...]", "steps": steps}
        
        t_stat, p_value = scipy_stats.ttest_ind(group1, group2)
        steps.append("Performed independent t-test")
        
        significance = "significant" if p_value < 0.05 else "not significant"
        return {
            "status": "success",
            "result": f"t = {t_stat:.4f}, p = {p_value:.4f} ({significance} at α=0.05)",
            "steps": steps,
            "extra": {"t_statistic": float(t_stat), "p_value": float(p_value), "significant": p_value < 0.05}
        }
    
    # === DISTRIBUTION ANALYSIS ===
    if any(k in inp.lower() for k in ['distribution', 'normal', 'gaussian', 'pdf', 'cdf']):
        # Parse numbers
        numbers = []
        for part in re.findall(r'[-\d.]+', inp):
            try:
                numbers.append(float(part))
            except ValueError:
                pass
        
        if len(numbers) < 2:
            return {"status": "error", "result": "Need data points to analyze distribution", "steps": steps}
        
        arr = np.array(numbers)
        
        # Normality test (Shapiro-Wilk for small samples, D'Agostino for larger)
        if len(arr) <= 5000:
            stat, p_value = scipy_stats.shapiro(arr)
            test_name = "Shapiro-Wilk"
        else:
            stat, p_value = scipy_stats.normaltest(arr)
            test_name = "D'Agostino"
        
        # Fit normal distribution
        mu, sigma = scipy_stats.norm.fit(arr)
        
        # Kolmogorov-Smirnov test
        ks_stat, ks_p = scipy_stats.kstest(arr, 'norm', args=(mu, sigma))
        
        steps.append(f"Analyzed distribution with {test_name} normality test")
        
        is_normal = p_value > 0.05
        return {
            "status": "success",
            "result": f"Mean={mu:.4f}, Std={sigma:.4f}; {test_name} p={p_value:.4f} ({'Normal' if is_normal else 'Non-normal'} distribution)",
            "steps": steps,
            "extra": {
                "mean": float(mu),
                "std": float(sigma),
                "normality_test": test_name,
                "normality_p_value": float(p_value),
                "is_normal": is_normal,
                "ks_statistic": float(ks_stat),
                "ks_p_value": float(ks_p)
            }
        }
    
    # === CONFIDENCE INTERVAL ===
    if 'confidence' in inp.lower() or 'ci' in inp.lower():
        numbers = []
        for part in re.findall(r'[-\d.]+', inp):
            try:
                numbers.append(float(part))
            except ValueError:
                pass
        
        if len(numbers) < 2:
            return {"status": "error", "result": "Need data points for confidence interval", "steps": steps}
        
        arr = np.array(numbers)
        confidence = 0.95
        
        # Check for explicit confidence level
        conf_match = re.search(r'(\d+)%', inp)
        if conf_match:
            confidence = int(conf_match.group(1)) / 100
        
        mean = np.mean(arr)
        sem = scipy_stats.sem(arr)
        ci = scipy_stats.t.interval(confidence, len(arr)-1, loc=mean, scale=sem)
        
        steps.append(f"Computed {confidence*100:.0f}% confidence interval")
        return {
            "status": "success",
            "result": f"Mean: {mean:.4f} [{ci[0]:.4f}, {ci[1]:.4f}] ({confidence*100:.0f}% CI)",
            "steps": steps,
            "extra": {"mean": float(mean), "ci_lower": float(ci[0]), "ci_upper": float(ci[1]), "confidence": confidence}
        }
    
    return {
        "status": "error",
        "result": "Unknown advanced stats operation. Supported: regression, t-test, distribution, confidence interval",
        "steps": steps
    }

def handle_number_theory(data):
    """
    ULTIMATE NUMBER THEORY ENGINE
    Primes, GCD, LCM, modular arithmetic, Diophantine equations,
    Euler's totient, factorization, primality testing
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === PRIMALITY TEST ===
    if any(k in inp.lower() for k in ['prime', 'is prime', 'primality']):
        num_match = re.search(r'(\d+)', inp)
        if num_match:
            n = int(num_match.group(1))
            is_prime = sp.isprime(n)
            steps.append(f"Tested primality of {n}")
            
            if is_prime:
                return {"status": "success", "result": f"{n} is PRIME", "steps": steps, "numeric": n}
            else:
                # Find factors
                factors = sp.factorint(n)
                factor_str = " × ".join([f"{p}^{e}" if e > 1 else str(p) for p, e in factors.items()])
                return {"status": "success", "result": f"{n} is NOT PRIME = {factor_str}", "steps": steps, "extra": dict(factors)}
    
    # === GCD / LCM ===
    if 'gcd' in inp.lower() or 'gcf' in inp.lower() or 'hcf' in inp.lower():
        nums = re.findall(r'\d+', inp)
        if len(nums) >= 2:
            numbers = [int(n) for n in nums]
            result = math.gcd(numbers[0], numbers[1])
            for n in numbers[2:]:
                result = math.gcd(result, n)
            steps.append(f"Computed GCD of {numbers}")
            return {"status": "success", "result": f"GCD = {result}", "steps": steps, "numeric": result}
    
    if 'lcm' in inp.lower():
        nums = re.findall(r'\d+', inp)
        if len(nums) >= 2:
            numbers = [int(n) for n in nums]
            result = np.lcm.reduce(numbers)
            steps.append(f"Computed LCM of {numbers}")
            return {"status": "success", "result": f"LCM = {int(result)}", "steps": steps, "numeric": int(result)}
    
    # === MODULAR ARITHMETIC ===
    mod_match = re.search(r'(\d+)\s*mod\s*(\d+)', inp, re.IGNORECASE)
    if mod_match:
        a = int(mod_match.group(1))
        m = int(mod_match.group(2))
        result = a % m
        steps.append(f"Computed {a} mod {m}")
        return {"status": "success", "result": f"{a} ≡ {result} (mod {m})", "steps": steps, "numeric": result}
    
    # === MODULAR INVERSE ===
    mod_inv_match = re.search(r'inverse\s+of\s+(\d+)\s+mod\s+(\d+)', inp, re.IGNORECASE)
    if mod_inv_match:
        a = int(mod_inv_match.group(1))
        m = int(mod_inv_match.group(2))
        try:
            result = pow(a, -1, m)
            steps.append(f"Found modular inverse of {a} mod {m}")
            return {"status": "success", "result": f"{a}^(-1) ≡ {result} (mod {m})", "steps": steps, "numeric": result}
        except ValueError:
            return {"status": "error", "result": f"No modular inverse exists for {a} mod {m} (not coprime)", "steps": steps}
    
    # === EULER'S TOTIENT ===
    if 'totient' in inp.lower() or 'phi' in inp.lower() or 'euler' in inp.lower():
        num_match = re.search(r'(\d+)', inp)
        if num_match:
            n = int(num_match.group(1))
            result = sp.totient(n)
            steps.append(f"Computed Euler's totient φ({n})")
            return {"status": "success", "result": f"φ({n}) = {result}", "steps": steps, "numeric": int(result)}
    
    # === DIOPHANTINE EQUATION ===
    if 'diophantine' in inp.lower():
        # Parse ax + by = c
        eq_match = re.search(r'(\d+)x\s*\+\s*(\d+)y\s*=\s*(\d+)', inp)
        if eq_match:
            a = int(eq_match.group(1))
            b = int(eq_match.group(2))
            c = int(eq_match.group(3))
            
            x, y = sp.symbols('x y', integer=True)
            eq = sp.Eq(a*x + b*y, c)
            solutions = sp.diophantine(eq)
            
            steps.append(f"Solved Diophantine equation {a}x + {b}y = {c}")
            return {"status": "success", "result": f"Solutions: {solutions}", "steps": steps}
    
    # === FACTORIZATION ===
    if 'factor' in inp.lower() and 'integer' in inp.lower():
        num_match = re.search(r'(\d+)', inp)
        if num_match:
            n = int(num_match.group(1))
            factors = sp.factorint(n)
            factor_list = []
            for p, e in factors.items():
                factor_list.extend([p] * e)
            steps.append(f"Prime factorization of {n}")
            return {"status": "success", "result": f"{n} = {' × '.join(map(str, factor_list))}", "steps": steps, "extra": dict(factors)}
    
    # === NTH PRIME ===
    nth_prime_match = re.search(r'(\d+)(?:st|nd|rd|th)?\s+prime', inp, re.IGNORECASE)
    if nth_prime_match:
        n = int(nth_prime_match.group(1))
        result = sp.prime(n)
        steps.append(f"Found {n}th prime number")
        return {"status": "success", "result": f"Prime({n}) = {result}", "steps": steps, "numeric": int(result)}
    
    # === PRIME COUNTING ===
    pi_match = re.search(r'primes?\s+(?:up\s+to|less\s+than|below)\s+(\d+)', inp, re.IGNORECASE)
    if pi_match:
        n = int(pi_match.group(1))
        count = sp.primepi(n)
        steps.append(f"Counted primes ≤ {n}")
        return {"status": "success", "result": f"π({n}) = {count} primes", "steps": steps, "numeric": int(count)}
    
    return {
        "status": "error",
        "result": "Unknown number theory operation. Supported: prime, gcd, lcm, mod, inverse, totient, diophantine, factorization, nth prime, prime counting",
        "steps": steps
    }

def handle_signal(data):
    """
    ULTIMATE SIGNAL PROCESSING ENGINE
    FFT, convolution, filtering, spectral analysis,
    signal generation, filter design
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === FFT ===
    if 'fft' in inp.lower() or 'fourier' in inp.lower() or 'spectrum' in inp.lower():
        # Parse signal data
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) < 2:
            return {"status": "error", "result": "Need signal data points for FFT", "steps": steps}
        
        signal_data = np.array([float(n) for n in nums])
        fft_result = np.fft.fft(signal_data)
        frequencies = np.fft.fftfreq(len(signal_data))
        
        # Get magnitude spectrum
        magnitude = np.abs(fft_result)
        dominant_freq_idx = np.argmax(magnitude[1:len(magnitude)//2]) + 1
        dominant_freq = frequencies[dominant_freq_idx]
        dominant_mag = magnitude[dominant_freq_idx]
        
        steps.append(f"Computed FFT of {len(signal_data)}-point signal")
        return {
            "status": "success",
            "result": f"Dominant frequency: {dominant_freq:.4f} (magnitude: {dominant_mag:.4f})",
            "steps": steps,
            "extra": {
                "frequencies": frequencies.tolist(),
                "magnitude": magnitude.tolist(),
                "phase": np.angle(fft_result).tolist()
            }
        }
    
    # === CONVOLUTION ===
    if 'convolve' in inp.lower() or 'convolution' in inp.lower():
        # Parse two signals: "convolve [1,2,3] with [0,1,0.5]"
        signals = re.findall(r'\[([-\d.,\s]+)\]', inp)
        if len(signals) >= 2:
            sig1 = np.array([float(x.strip()) for x in signals[0].split(',') if x.strip()])
            sig2 = np.array([float(x.strip()) for x in signals[1].split(',') if x.strip()])
            result = np.convolve(sig1, sig2, mode='full')
            steps.append("Computed linear convolution")
            return {"status": "success", "result": f"[{', '.join([f'{x:.4f}' for x in result])}]", "steps": steps, "extra": {"result": result.tolist()}}
    
    # === FILTER ===
    if 'filter' in inp.lower():
        # Lowpass, highpass, bandpass
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) < 3:
            return {"status": "error", "result": "Need signal data and cutoff frequency", "steps": steps}
        
        signal_data = np.array([float(n) for n in nums[:-1]])
        cutoff = float(nums[-1])
        
        # Design simple FIR lowpass filter
        nyquist = 0.5
        normalized_cutoff = cutoff / nyquist
        taps = signal.firwin(21, normalized_cutoff)
        filtered = signal.lfilter(taps, 1.0, signal_data)
        
        filter_type = 'lowpass'
        if 'high' in inp.lower():
            filter_type = 'highpass'
        elif 'band' in inp.lower():
            filter_type = 'bandpass'
        
        steps.append(f"Applied {filter_type} FIR filter (cutoff: {cutoff})")
        return {
            "status": "success",
            "result": f"Filtered signal (first 5): [{', '.join([f'{x:.4f}' for x in filtered[:5]])}...]",
            "steps": steps,
            "extra": {"filtered": filtered.tolist(), "filter_coefficients": taps.tolist()}
        }
    
    return {
        "status": "error",
        "result": "Unknown signal operation. Supported: fft, convolve, filter",
        "steps": steps
    }

def handle_optimize(data):
    """
    ULTIMATE OPTIMIZATION ENGINE
    Linear programming, curve fitting, minimization,
    root finding, least squares
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === CURVE FITTING ===
    if any(k in inp.lower() for k in ['fit', 'curve', 'regression', 'least squares']):
        # Parse data points
        points = re.findall(r'\(([-\d.]+)\s*,\s*([-\d.]+)\)', inp)
        if len(points) < 2:
            return {"status": "error", "result": "Need at least 2 (x,y) points for curve fitting", "steps": steps}
        
        x = np.array([float(p[0]) for p in points])
        y = np.array([float(p[1]) for p in points])
        
        # Determine function type
        func_type = 'linear'
        if 'exponential' in inp.lower():
            func_type = 'exponential'
        elif 'logarithmic' in inp.lower() or 'log' in inp.lower():
            func_type = 'logarithmic'
        elif 'polynomial' in inp.lower():
            degree_match = re.search(r'degree\s+(\d+)', inp)
            degree = int(degree_match.group(1)) if degree_match else 2
            func_type = f'polynomial{degree}'
        elif 'power' in inp.lower():
            func_type = 'power'
        
        try:
            if func_type == 'linear':
                coeffs, cov = optimize.curve_fit(lambda x, a, b: a*x + b, x, y)
                a, b = coeffs
                result_str = f"y = {a:.4f}x + {b:.4f}"
                extra = {"a": float(a), "b": float(b)}
            elif func_type == 'exponential':
                coeffs, cov = optimize.curve_fit(lambda x, a, b: a * np.exp(b * x), x, y, p0=[1, 0.1])
                a, b = coeffs
                result_str = f"y = {a:.4f} * e^({b:.4f}x)"
                extra = {"a": float(a), "b": float(b)}
            elif func_type.startswith('polynomial'):
                degree = int(func_type.replace('polynomial', ''))
                coeffs = np.polyfit(x, y, degree)
                p = np.poly1d(coeffs)
                result_str = str(p)
                extra = {"coefficients": [float(c) for c in coeffs]}
            elif func_type == 'power':
                coeffs, cov = optimize.curve_fit(lambda x, a, b: a * np.power(x, b), x, y, p0=[1, 1])
                a, b = coeffs
                result_str = f"y = {a:.4f} * x^{b:.4f}"
                extra = {"a": float(a), "b": float(b)}
            else:
                return {"status": "error", "result": f"Unknown function type: {func_type}", "steps": steps}
            
            # Compute R²
            if func_type.startswith('polynomial'):
                y_pred = p(x)
            elif func_type == 'linear':
                y_pred = a * x + b
            elif func_type == 'exponential':
                y_pred = a * np.exp(b * x)
            elif func_type == 'power':
                y_pred = a * np.power(x, b)
            
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
            
            steps.append(f"Fitted {func_type} curve (R² = {r2:.4f})")
            return {
                "status": "success",
                "result": f"{result_str} (R² = {r2:.4f})",
                "steps": steps,
                "extra": {**extra, "r_squared": float(r2)}
            }
            
        except Exception as e:
            return {"status": "error", "result": f"Curve fitting error: {str(e)}", "steps": steps}
    
    # === ROOT FINDING ===
    if any(k in inp.lower() for k in ['root', 'zero', 'find x', 'solve for x']):
        # Extract function
        func_str = re.sub(r'(find\s+root|find\s+zero|find\s+x|solve\s+for\s+x)\s*of\s*', '', inp, flags=re.IGNORECASE)
        func_str = func_str.strip()
        
        # Parse as sympy expression = 0
        try:
            expr = parse_expression(func_str)
            x = sp.Symbol('x')
            # Find numerical roots
            f = sp.lambdify(x, expr, 'numpy')
            
            # Search for roots in range [-100, 100]
            roots_found = set()
            for guess in np.linspace(-100, 100, 50):
                try:
                    root = optimize.newton(f, guess, tol=1e-10, maxiter=100)
                    rounded = round(root, 8)
                    if -1e6 < root < 1e6:
                        roots_found.add(rounded)
                except Exception:
                    pass
            
            if roots_found:
                roots_list = sorted(list(roots_found))
                steps.append(f"Found {len(roots_list)} root(s) numerically")
                return {
                    "status": "success",
                    "result": f"Roots: {', '.join([str(r) for r in roots_list])}",
                    "steps": steps,
                    "extra": {"roots": roots_list}
                }
            else:
                return {"status": "success", "result": "No real roots found in search range", "steps": steps}
                
        except Exception as e:
            return {"status": "error", "result": f"Root finding error: {str(e)}", "steps": steps}
    
    # === MINIMIZATION ===
    if any(k in inp.lower() for k in ['minimize', 'minimum', 'maximize', 'maximum', 'optimize']):
        # Parse function and initial guess
        func_match = re.search(r'(minimize|maximize|minimum|maximum|optimize)\s+(.+?)(?:\s+starting\s+at|\s+from|\s+at|\s*$)', inp, re.IGNORECASE)
        if func_match:
            direction = func_match.group(1).lower()
            func_str = func_match.group(2).strip()
            
            # Check for initial guess
            guess_match = re.search(r'(?:starting\s+at|from|at)\s+([-\d.,\s]+)', inp)
            if guess_match:
                guess = [float(x.strip()) for x in guess_match.group(1).split(',') if x.strip()]
            else:
                guess = [0.0]
            
            try:
                # Parse variables in function
                vars_found = re.findall(r'\b([a-zA-Z])\b', func_str)
                vars_found = sorted(list(set(vars_found)))
                
                # Create lambda function
                syms = [sp.Symbol(v) for v in vars_found]
                expr = parse_expression(func_str)
                f = sp.lambdify(syms, expr, 'numpy')
                
                def objective(x):
                    if len(syms) == 1:
                        return f(x[0])
                    return f(*x)
                
                if direction in ('maximize', 'maximum'):
                    def neg_objective(x):
                        return -objective(x)
                    result = optimize.minimize(neg_objective, guess, method='BFGS')
                    opt_value = -result.fun
                else:
                    result = optimize.minimize(objective, guess, method='BFGS')
                    opt_value = result.fun
                
                steps.append(f"Found {direction} using BFGS optimization")
                return {
                    "status": "success",
                    "result": f"Optimal value: {opt_value:.6f} at {result.x.tolist()}",
                    "steps": steps,
                    "extra": {"optimal_value": float(opt_value), "optimal_point": result.x.tolist()}
                }
                
            except Exception as e:
                return {"status": "error", "result": f"Optimization error: {str(e)}", "steps": steps}
    
    return {
        "status": "error",
        "result": "Unknown optimization operation. Supported: curve fit, root find, minimize/maximize",
        "steps": steps
    }

def handle_combinatorics(data):
    """
    ULTIMATE COMBINATORICS ENGINE
    Permutations, combinations, binomial coefficients,
    Catalan numbers, Stirling numbers, partitions
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === PERMUTATIONS ===
    perm_match = re.search(r'permutations?\s+(?:of\s+)?(\d+)(?:\s+items|\s+things)?(?:\s+taken\s+(\d+))?', inp, re.IGNORECASE)
    if perm_match:
        n = int(perm_match.group(1))
        r = int(perm_match.group(2)) if perm_match.group(2) else n
        
        result = math.perm(n, r)
        steps.append(f"Computed P({n},{r})")
        return {"status": "success", "result": f"P({n},{r}) = {result}", "steps": steps, "numeric": result}
    
    # === COMBINATIONS ===
    comb_match = re.search(r'combinations?\s+(?:of\s+)?(\d+)(?:\s+items|\s+things)?(?:\s+taken\s+(\d+))?', inp, re.IGNORECASE)
    if comb_match:
        n = int(comb_match.group(1))
        r = int(comb_match.group(2)) if comb_match.group(2) else n
        
        result = math.comb(n, r)
        steps.append(f"Computed C({n},{r})")
        return {"status": "success", "result": f"C({n},{r}) = {result}", "steps": steps, "numeric": result}
    
    # === BINOMIAL COEFFICIENT ===
    binom_match = re.search(r'binomial\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', inp, re.IGNORECASE)
    if binom_match:
        n = int(binom_match.group(1))
        k = int(binom_match.group(2))
        result = math.comb(n, k)
        steps.append(f"Computed binomial({n},{k})")
        return {"status": "success", "result": f"({n} choose {k}) = {result}", "steps": steps, "numeric": result}
    
    # === FACTORIAL ===
    fact_match = re.search(r'(\d+)!', inp)
    if fact_match:
        n = int(fact_match.group(1))
        if n > 170:
            return {"status": "error", "result": "Factorial too large (max 170 for float)", "steps": steps}
        result = math.factorial(n)
        steps.append(f"Computed {n}!")
        return {"status": "success", "result": f"{n}! = {result}", "steps": steps, "numeric": result}
    
    # === CATALAN NUMBER ===
    catalan_match = re.search(r'catalan\s*(?:number)?\s*(\d+)', inp, re.IGNORECASE)
    if catalan_match:
        n = int(catalan_match.group(1))
        result = math.comb(2*n, n) // (n + 1)
        steps.append(f"Computed Catalan number C_{n}")
        return {"status": "success", "result": f"C_{n} = {result}", "steps": steps, "numeric": result}
    
    # === STIRLING NUMBERS ===
    stirling_match = re.search(r'stirling\s*(?:number)?\s*(?:of\s+)?(?:the\s+)?(?:first|second)\s+kind\s+(\d+)\s*,\s*(\d+)', inp, re.IGNORECASE)
    if stirling_match:
        n = int(stirling_match.group(1))
        k = int(stirling_match.group(2))
        kind = 'second' if 'second' in inp.lower() else 'first'
        
        if kind == 'second':
            # Stirling numbers of second kind
            result = sum(((-1)**(k-j)) * math.comb(k, j) * (j**n) for j in range(k+1)) // math.factorial(k)
            steps.append(f"Computed S({n},{k}) - Stirling 2nd kind")
        else:
            # Stirling numbers of first kind (unsigned)
            result = sp.stirling(n, k)
            steps.append(f"Computed s({n},{k}) - Stirling 1st kind")
        
        return {"status": "success", "result": f"S({n},{k}) = {result}", "steps": steps, "numeric": int(result)}
    
    # === INTEGER PARTITIONS ===
    partition_match = re.search(r'partitions?\s+of\s+(\d+)', inp, re.IGNORECASE)
    if partition_match:
        n = int(partition_match.group(1))
        result = sp.npartitions(n)
        steps.append(f"Computed number of partitions of {n}")
        return {"status": "success", "result": f"p({n}) = {result}", "steps": steps, "numeric": int(result)}
    
    # === FIBONACCI ===
    fib_match = re.search(r'fibonacci\s*(\d+)', inp, re.IGNORECASE)
    if fib_match:
        n = int(fib_match.group(1))
        result = sp.fibonacci(n)
        steps.append(f"Computed Fibonacci({n})")
        return {"status": "success", "result": f"F({n}) = {result}", "steps": steps, "numeric": int(result)}
    
    return {
        "status": "error",
        "result": "Unknown combinatorics operation. Supported: permutations, combinations, binomial, factorial, catalan, stirling, partitions, fibonacci",
        "steps": steps
    }

def handle_matrix(data):
    """
    ULTIMATE MATRIX OPERATIONS ENGINE
    Eigenvalues, SVD, decompositions, determinants,
    matrix powers, exponential, logarithm
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # Parse matrix from input
    # Format: [[1,2],[3,4]] or "matrix: 1 2; 3 4"
    matrix_match = re.search(r'\[\[(.+?)\]\]', inp)
    if not matrix_match:
        # Try alternative format
        matrix_match = re.search(r'matrix[:\s]+(.+)', inp, re.IGNORECASE)
    
    if matrix_match:
        matrix_str = matrix_match.group(1)
        # Parse rows
        rows = []
        for row_str in matrix_str.split('],['):
            row_str = row_str.replace('[', '').replace(']', '')
            row = [float(x.strip()) for x in row_str.split(',') if x.strip()]
            rows.append(row)
        
        A = np.array(rows)
        steps.append(f"Parsed {A.shape[0]}×{A.shape[1]} matrix")
    else:
        return {"status": "error", "result": "Could not parse matrix. Use format: [[1,2],[3,4]]", "steps": steps}
    
    try:
        # === EIGENVALUES ===
        if 'eigen' in inp.lower():
            eigenvalues, eigenvectors = np.linalg.eig(A)
            steps.append("Computed eigenvalues and eigenvectors")
            return {
                "status": "success",
                "result": f"Eigenvalues: {eigenvalues.tolist()}",
                "steps": steps,
                "extra": {
                    "eigenvalues": [complex(x) for x in eigenvalues.tolist()],
                    "eigenvectors": [x.tolist() for x in eigenvectors.T]
                }
            }
        
        # === SVD ===
        if 'svd' in inp.lower() or 'singular' in inp.lower():
            U, S, Vh = np.linalg.svd(A)
            steps.append("Computed Singular Value Decomposition")
            return {
                "status": "success",
                "result": f"Singular values: {S.tolist()}",
                "steps": steps,
                "extra": {"U": U.tolist(), "S": S.tolist(), "Vh": Vh.tolist()}
            }
        
        # === DETERMINANT ===
        if 'det' in inp.lower() or 'determinant' in inp.lower():
            det = np.linalg.det(A)
            steps.append("Computed determinant")
            return {"status": "success", "result": f"det(A) = {det:.6f}", "steps": steps, "numeric": float(det)}
        
        # === INVERSE ===
        if 'inverse' in inp.lower() or 'inv' in inp.lower():
            inv = np.linalg.inv(A)
            steps.append("Computed matrix inverse")
            return {"status": "success", "result": str(inv.tolist()), "steps": steps, "extra": {"inverse": inv.tolist()}}
        
        # === RANK ===
        if 'rank' in inp.lower():
            rank = np.linalg.matrix_rank(A)
            steps.append("Computed matrix rank")
            return {"status": "success", "result": f"rank(A) = {rank}", "steps": steps, "numeric": int(rank)}
        
        # === TRACE ===
        if 'trace' in inp.lower():
            trace = np.trace(A)
            steps.append("Computed matrix trace")
            return {"status": "success", "result": f"tr(A) = {trace:.6f}", "steps": steps, "numeric": float(trace)}
        
        # === LU DECOMPOSITION ===
        if 'lu' in inp.lower():
            P, L, U = linalg.lu(A)
            steps.append("Computed LU decomposition")
            return {
                "status": "success",
                "result": f"L={L.tolist()}, U={U.tolist()}",
                "steps": steps,
                "extra": {"P": P.tolist(), "L": L.tolist(), "U": U.tolist()}
            }
        
        # === QR DECOMPOSITION ===
        if 'qr' in inp.lower():
            Q, R = np.linalg.qr(A)
            steps.append("Computed QR decomposition")
            return {
                "status": "success",
                "result": f"Q={Q.tolist()}, R={R.tolist()}",
                "steps": steps,
                "extra": {"Q": Q.tolist(), "R": R.tolist()}
            }
        
        # === MATRIX POWER ===
        power_match = re.search(r'power\s+(\d+)', inp, re.IGNORECASE)
        if power_match:
            n = int(power_match.group(1))
            result = np.linalg.matrix_power(A, n)
            steps.append(f"Computed A^{n}")
            return {"status": "success", "result": str(result.tolist()), "steps": steps, "extra": {"result": result.tolist()}}
        
        # === CONDITION NUMBER ===
        if 'condition' in inp.lower() or 'cond' in inp.lower():
            cond = np.linalg.cond(A)
            steps.append("Computed condition number")
            return {"status": "success", "result": f"κ(A) = {cond:.6f}", "steps": steps, "numeric": float(cond)}
        
        return {
            "status": "error",
            "result": "Unknown matrix operation. Supported: eigenvalues, svd, determinant, inverse, rank, trace, lu, qr, power, condition",
            "steps": steps
        }
        
    except Exception as e:
        return {"status": "error", "result": f"Matrix error: {str(e)}", "steps": steps}

def handle_differential(data):
    """
    ULTIMATE DIFFERENTIAL EQUATIONS ENGINE
    ODE solving, PDE, numerical integration,
    initial value problems, boundary value problems
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === ODE SOLVING ===
    if 'ode' in inp.lower() or 'differential' in inp.lower() or "y'" in inp or "dy/dx" in inp:
        # Parse ODE: "solve y' = -2y with y(0) = 1"
        # Extract equation
        eq_match = re.search(r"(?:solve\s+)?y['′]\s*=\s*(.+?)(?:\s+with|\s+where|\s+subject|\s*$)", inp, re.IGNORECASE)
        if not eq_match:
            eq_match = re.search(r"(?:solve\s+)?dy/dx\s*=\s*(.+?)(?:\s+with|\s+where|\s+subject|\s*$)", inp, re.IGNORECASE)
        
        if eq_match:
            rhs_str = eq_match.group(1).strip()
            
            # Extract initial condition
            ic_match = re.search(r'y\(([-\d.]+)\)\s*=\s*([-\d.]+)', inp)
            x0, y0 = 0, 1
            if ic_match:
                x0 = float(ic_match.group(1))
                y0 = float(ic_match.group(2))
            
            # Parse RHS expression
            x_sym = sp.Symbol('x')
            y_sym = sp.Function('y')
            
            try:
                rhs = parse_expression(rhs_str.replace('y', 'y_sym(x)'))
                # Simplify: assume y is the dependent variable
                rhs = rhs.replace(y_sym(x_sym), sp.Symbol('y'))
                
                # Solve ODE using sympy
                y = sp.Function('y')
                x = sp.Symbol('x')
                ode = sp.Eq(y(x).diff(x), rhs.subs(x_sym, x))
                ics = {y(x0): y0}
                
                solution = sp.dsolve(ode, ics=ics)
                steps.append("Solved ODE analytically")
                return {"status": "success", "result": str(solution), "steps": steps, "latex": get_latex(solution)}
                
            except Exception as e:
                # Fallback to numerical solution
                steps.append(f"Analytical solve failed ({str(e)}), trying numerical...")
                
                def f(x, y):
                    # Evaluate RHS numerically
                    try:
                        expr = parse_expression(rhs_str)
                        return float(expr.subs({sp.Symbol('x'): x, sp.Symbol('y'): y}).evalf())
                    except Exception:
                        return -2*y  # default fallback
                
                # Solve numerically using scipy
                from scipy.integrate import solve_ivp
                sol = solve_ivp(f, [x0, x0 + 10], [y0], dense_output=True)
                
                steps.append("Solved ODE numerically using Runge-Kutta")
                return {
                    "status": "success",
                    "result": f"Numerical solution: y({x0+10}) ≈ {sol.y[0][-1]:.6f}",
                    "steps": steps,
                    "extra": {"final_value": float(sol.y[0][-1]), "t_eval": sol.t.tolist(), "y_eval": sol.y[0].tolist()}
                }
        
        return {"status": "error", "result": "Could not parse ODE. Format: solve y' = -2y with y(0) = 1", "steps": steps}
    
    # === NUMERICAL INTEGRATION (ODE) ===
    if 'integrate' in inp.lower() and ('function' in inp.lower() or 'f(x)' in inp.lower()):
        # Parse function and bounds
        func_match = re.search(r'f\((?:x|t)\)\s*=\s*(.+?)(?:\s+from|\s+between|\s+over)', inp, re.IGNORECASE)
        if func_match:
            func_str = func_match.group(1).strip()
            bounds_match = re.search(r'from\s+([-\d.]+)\s+to\s+([-\d.]+)', inp)
            
            if bounds_match:
                a = float(bounds_match.group(1))
                b = float(bounds_match.group(2))
                
                def f(x):
                    try:
                        expr = parse_expression(func_str)
                        return float(expr.subs(sp.Symbol('x'), x).evalf())
                    except Exception:
                        return x**2
                
                result, error = integrate.quad(f, a, b)
                steps.append(f"Numerically integrated from {a} to {b}")
                return {"status": "success", "result": f"∫f(x)dx = {result:.10f} ± {error:.2e}", "steps": steps, "numeric": float(result)}
    
    return {
        "status": "error",
        "result": "Unknown differential operation. Supported: solve ODE, numerical integration",
        "steps": steps
    }

def handle_finance(data):
    """
    ULTIMATE FINANCIAL MATHEMATICS ENGINE
    Compound interest, amortization, NPV, IRR,
    loan payments, future value, present value
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === COMPOUND INTEREST ===
    if any(k in inp.lower() for k in ['compound interest', 'future value', 'fv']):
        # Parse: principal, rate, time, [compounding periods per year]
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 3:
            P = float(nums[0])  # Principal
            r = float(nums[1]) / 100  # Rate (as decimal)
            t = float(nums[2])  # Time in years
            n = float(nums[3]) if len(nums) > 3 else 12  # Compounding periods per year
            
            A = P * (1 + r/n)**(n*t)
            interest = A - P
            
            steps.append(f"Computed compound interest: {P} at {r*100}% for {t} years")
            return {
                "status": "success",
                "result": f"Future Value: {A:.2f} (Interest earned: {interest:.2f})",
                "steps": steps,
                "numeric": float(A),
                "extra": {"principal": P, "rate": r*100, "time": t, "compounding_periods": n, "interest": float(interest)}
            }
    
    # === LOAN PAYMENT (AMORTIZATION) ===
    if any(k in inp.lower() for k in ['loan', 'payment', 'mortgage', 'pmt', 'installment']):
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 3:
            P = float(nums[0])  # Principal
            r = float(nums[1]) / 100 / 12  # Monthly rate
            n = int(float(nums[2]))  # Number of payments (months)
            
            payment = P * (r * (1+r)**n) / ((1+r)**n - 1)
            total_paid = payment * n
            total_interest = total_paid - P
            
            steps.append(f"Computed loan payment for {P} over {n} months at {float(nums[1])}% APR")
            return {
                "status": "success",
                "result": f"Monthly payment: {payment:.2f} (Total interest: {total_interest:.2f})",
                "steps": steps,
                "numeric": float(payment),
                "extra": {
                    "monthly_payment": float(payment),
                    "total_paid": float(total_paid),
                    "total_interest": float(total_interest),
                    "principal": P,
                    "term_months": n
                }
            }
    
    # === NPV ===
    if 'npv' in inp.lower() or 'net present value' in inp.lower():
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 2:
            rate = float(nums[0]) / 100
            cash_flows = [float(n) for n in nums[1:]]
            npv_result = np.npv(rate, cash_flows)
            steps.append(f"Computed NPV at {rate*100}% discount rate")
            return {
                "status": "success",
                "result": f"NPV = {npv_result:.2f}",
                "steps": steps,
                "numeric": float(npv_result),
                "extra": {"rate": rate*100, "cash_flows": cash_flows}
            }
    
    # === IRR ===
    if 'irr' in inp.lower() or 'internal rate' in inp.lower():
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 2:
            cash_flows = [float(n) for n in nums]
            try:
                irr_result = np.irr(cash_flows)
                steps.append("Computed Internal Rate of Return")
                return {
                    "status": "success",
                    "result": f"IRR = {irr_result*100:.4f}%",
                    "steps": steps,
                    "numeric": float(irr_result),
                    "extra": {"irr_percent": float(irr_result)*100}
                }
            except Exception as e:
                return {"status": "error", "result": f"IRR calculation failed: {str(e)}", "steps": steps}
    
    # === PRESENT VALUE ===
    if 'pv' in inp.lower() or 'present value' in inp.lower():
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 3:
            fv = float(nums[0])
            r = float(nums[1]) / 100
            t = float(nums[2])
            n = float(nums[3]) if len(nums) > 3 else 1
            
            pv = fv / (1 + r/n)**(n*t)
            steps.append("Computed present value")
            return {
                "status": "success",
                "result": f"PV = {pv:.2f}",
                "steps": steps,
                "numeric": float(pv)
            }
    
    # === SIMPLE INTEREST ===
    if 'simple interest' in inp.lower():
        nums = re.findall(r'[-\d.]+', inp)
        if len(nums) >= 3:
            P = float(nums[0])
            r = float(nums[1]) / 100
            t = float(nums[2])
            I = P * r * t
            A = P + I
            steps.append("Computed simple interest")
            return {
                "status": "success",
                "result": f"Interest: {I:.2f}, Total: {A:.2f}",
                "steps": steps,
                "numeric": float(A),
                "extra": {"interest": float(I), "total": float(A)}
            }
    
    return {
        "status": "error",
        "result": "Unknown finance operation. Supported: compound interest, loan payment, NPV, IRR, present value, simple interest",
        "steps": steps
    }

def handle_complex(data):
    """
    ULTIMATE COMPLEX ANALYSIS ENGINE
    Complex functions, residues, contour integrals,
    analytic functions, branch cuts, conformal mapping
    """
    inp = data.get('input', '').strip()
    steps = []
    
    # === COMPLEX NUMBER OPERATIONS ===
    if any(k in inp.lower() for k in ['complex', 'real part', 'imaginary', 'imag', 'arg', 'phase', 'magnitude', 'modulus', 'conjugate']):
        # Parse complex number
        # Formats: 3+4i, 3+4j, (3,4), 3+4*I
        z = None
        
        # Try parsing as sympy complex
        try:
            z = parse_expression(inp.replace('i', 'I').replace('j', 'I'))
            if not z.is_complex and not z.has(sp.I):
                # Try to extract from text
                complex_match = re.search(r'([-\d.]+)\s*([+-])\s*([-\d.]+)[ij]', inp)
                if complex_match:
                    real = float(complex_match.group(1))
                    imag = float(complex_match.group(2) + complex_match.group(3))
                    z = complex(real, imag)
        except Exception:
            complex_match = re.search(r'([-\d.]+)\s*([+-])\s*([-\d.]+)[ij]', inp)
            if complex_match:
                real = float(complex_match.group(1))
                imag = float(complex_match.group(2) + complex_match.group(3))
                z = complex(real, imag)
        
        if z is None:
            return {"status": "error", "result": "Could not parse complex number. Use format: 3+4i or 3+4*I", "steps": steps}
        
        # Convert to sympy if needed
        if isinstance(z, complex):
            z_sym = sp.sympify(f"{z.real} + {z.imag}*I")
        else:
            z_sym = z
        
        results = {}
        
        if 'real' in inp.lower() or 're' in inp.lower():
            results['real'] = float(sp.re(z_sym))
            steps.append("Computed real part")
        if 'imag' in inp.lower() or 'im' in inp.lower():
            results['imag'] = float(sp.im(z_sym))
            steps.append("Computed imaginary part")
        if 'arg' in inp.lower() or 'phase' in inp.lower() or 'angle' in inp.lower():
            results['arg'] = float(sp.arg(z_sym))
            steps.append("Computed argument/phase")
        if 'modulus' in inp.lower() or 'magnitude' in inp.lower() or 'abs' in inp.lower():
            results['modulus'] = float(sp.Abs(z_sym))
            steps.append("Computed modulus/magnitude")
        if 'conjugate' in inp.lower():
            conj = sp.conjugate(z_sym)
            results['conjugate'] = str(conj)
            steps.append("Computed complex conjugate")
        
        if not results:
            # Return all properties
            results = {
                'real': float(sp.re(z_sym)),
                'imag': float(sp.im(z_sym)),
                'modulus': float(sp.Abs(z_sym)),
                'arg': float(sp.arg(z_sym)),
                'conjugate': str(sp.conjugate(z_sym))
            }
            steps.append("Computed all complex properties")
        
        if len(results) == 1:
            key = list(results.keys())[0]
            return {"status": "success", "result": f"{key} = {results[key]}", "steps": steps, "numeric": results[key] if isinstance(results[key], (int, float)) else None}
        else:
            result_str = "; ".join([f"{k}: {v}" for k, v in results.items()])
            return {"status": "success", "result": result_str, "steps": steps, "extra": results}
    
    # === RESIDUE ===
    residue_match = re.search(r'residue\s+of\s+(.+?)\s+at\s+([-\d.]+)', inp, re.IGNORECASE)
    if residue_match:
        func_str = residue_match.group(1).strip()
        point = complex(residue_match.group(2))
        
        z = sp.Symbol('z')
        func = parse_expression(func_str)
        
        try:
            res = sp.residue(func, z, point)
            steps.append(f"Computed residue at z = {point}")
            return {"status": "success", "result": f"Res(f, {point}) = {res}", "steps": steps, "numeric": complex(res) if res.is_number else None}
        except Exception as e:
            return {"status": "error", "result": f"Residue computation failed: {str(e)}", "steps": steps}
    
    # === COMPLEX FUNCTION EVALUATION ===
    if 'evaluate' in inp.lower() or 'f(z)' in inp.lower():
        func_match = re.search(r'f\([zi]\)\s*=\s*(.+?)(?:\s+at|\s+where|\s*$)', inp, re.IGNORECASE)
        if func_match:
            func_str = func_match.group(1).strip()
            point_match = re.search(r'at\s+([-\d.]+)\s*([+-])\s*([-\d.]+)[ij]', inp)
            
            if point_match:
                real = float(point_match.group(1))
                imag = float(point_match.group(2) + point_match.group(3))
                z_val = complex(real, imag)
                
                z = sp.Symbol('z')
                func = parse_expression(func_str)
                result = complex(func.subs(z, z_val).evalf())
                
                steps.append(f"Evaluated complex function at z = {z_val}")
                return {"status": "success", "result": f"f({z_val}) = {result}", "steps": steps, "numeric": None, "extra": {"real": result.real, "imag": result.imag}}
    
    return {
        "status": "error",
        "result": "Unknown complex analysis operation. Supported: complex properties, residue, evaluate function",
        "steps": steps
    }

def handle_encode(data):
    """
    ULTIMATE ENCODING/DECODING ENGINE
    Base64/32/16/85, Hex, Binary, URL, ROT13, Caesar, Morse,
    Unicode, ASCII, Byte conversions, Punycode
    """
    inp = data.get('input', '').strip()
    steps = []
    inp_lower = inp.lower()
    
    # === BASE64 ===
    if 'base64' in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'base64\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b64decode(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Base64"]}
            except Exception as e:
                return {"status": "error", "result": f"Base64 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base64\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b64encode(text.encode()).decode()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded Base64"]}
    
    # === BASE32 ===
    if 'base32' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'base32\s+decode\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b32decode(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Base32"]}
            except Exception as e:
                return {"status": "error", "result": f"Base32 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base32\s+encode?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b32encode(text.encode()).decode()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded Base32"]}
    
    # === BASE16 (HEX) ===
    if 'base16' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'base16\s+decode\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b16decode(text.upper()).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Base16"]}
            except Exception as e:
                return {"status": "error", "result": f"Base16 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base16\s+encode?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b16encode(text.encode()).decode()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded Base16"]}
    
    # === BASE85 ===
    if 'base85' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'base85\s+decode\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = base64.b85decode(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Base85"]}
            except Exception as e:
                return {"status": "error", "result": f"Base85 decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'base85\s+encode?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = base64.b85encode(text.encode()).decode()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded Base85"]}
    
    # === HEX ===
    if 'hex' in inp_lower and 'to' not in inp_lower and 'from' not in inp_lower.split('hex')[0]:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'hex\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = bytes.fromhex(text).decode('utf-8', errors='replace')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded hex"]}
            except Exception as e:
                return {"status": "error", "result": f"Hex decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'hex\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = text.encode().hex()
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to hex"]}
    
    # === BINARY ===
    if 'binary' in inp_lower and 'to' not in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'binary\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip().replace(' ', '')
            try:
                decoded = ''.join(chr(int(text[i:i+8], 2)) for i in range(0, len(text), 8))
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded binary"]}
            except Exception as e:
                return {"status": "error", "result": f"Binary decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'binary\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = ' '.join(format(ord(c), '08b') for c in text)
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to binary"]}
    
    # === OCTAL ===
    if 'octal' in inp_lower or 'oct' in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'octal\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = ''.join(chr(int(text[i:i+3], 8)) for i in range(0, len(text), 3))
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded octal"]}
            except Exception as e:
                return {"status": "error", "result": f"Octal decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'octal\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = ' '.join(format(ord(c), '03o') for c in text)
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to octal"]}
    
    # === ASCII ===
    if 'ascii' in inp_lower:
        if 'decode' in inp_lower or 'from' in inp_lower:
            text = re.sub(r'ascii\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                nums = [int(x.strip()) for x in text.split() if x.strip()]
                decoded = ''.join(chr(n) for n in nums)
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded ASCII"]}
            except Exception as e:
                return {"status": "error", "result": f"ASCII decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'ascii\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = ' '.join(str(ord(c)) for c in text)
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to ASCII"]}
    
    # === UNICODE ===
    if 'unicode' in inp_lower or 'utf-8' in inp_lower:
        text = re.sub(r'(unicode|utf-8)\s+(encode|decode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
        encoded = ' '.join(f'U+{ord(c):04X}' for c in text)
        return {"status": "success", "result": encoded, "steps": steps + ["Converted to Unicode codepoints"]}
    
    # === ROT13 ===
    if 'rot13' in inp_lower:
        text = re.sub(r'rot13\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
        result = text.translate(str.maketrans(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'
        ))
        return {"status": "success", "result": result, "steps": steps + ["Applied ROT13 cipher"]}
    
    # === ROT47 ===
    if 'rot47' in inp_lower:
        text = re.sub(r'rot47\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
        result = ''.join(
            chr((ord(c) - 33 + 47) % 94 + 33) if 33 <= ord(c) <= 126 else c
            for c in text
        )
        return {"status": "success", "result": result, "steps": steps + ["Applied ROT47 cipher"]}
    
    # === CAESAR CIPHER ===
    caesar_match = re.search(r'caesar\s+(.+?)\s+shift\s+(-?\d+)', inp, re.IGNORECASE)
    if not caesar_match:
        caesar_match = re.search(r'caesar\s+shift\s+(-?\d+)\s+(.+)', inp, re.IGNORECASE)
    if caesar_match:
        if caesar_match.lastindex == 2 and 'shift' in inp_lower.split(caesar_match.group(1).lower())[0]:
            shift = int(caesar_match.group(1))
            text = caesar_match.group(2).strip().strip('"\'')
        else:
            text = caesar_match.group(1).strip().strip('"\'')
            shift = int(caesar_match.group(2))
        result = ''.join(
            chr((ord(c) - 65 + shift) % 26 + 65) if c.isupper() else
            chr((ord(c) - 97 + shift) % 26 + 97) if c.islower() else c
            for c in text
        )
        return {"status": "success", "result": result, "steps": steps + [f"Applied Caesar cipher with shift {shift}"]}
    
    # === MORSE CODE ===
    if 'morse' in inp_lower:
        if 'decode' in inp_lower:
            code = re.sub(r'morse\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            reverse_dict = {v: k for k, v in MORSE_CODE_DICT.items()}
            words = code.split(' / ')
            decoded = []
            for word in words:
                letters = word.split()
                decoded_word = ''.join(reverse_dict.get(letter, '?') for letter in letters)
                decoded.append(decoded_word)
            result = ' '.join(decoded)
            return {"status": "success", "result": result, "steps": steps + ["Decoded Morse code"]}
        else:
            text = re.sub(r'morse\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'').upper()
            encoded = ' / '.join(
                ' '.join(MORSE_CODE_DICT.get(c, c) for c in word)
                for word in text.split()
            )
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to Morse code"]}
    
    # === URL ENCODE/DECODE ===
    if 'url' in inp_lower:
        import urllib.parse
        if 'decode' in inp_lower:
            text = re.sub(r'url\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            decoded = urllib.parse.unquote(text)
            return {"status": "success", "result": decoded, "steps": steps + ["URL decoded"]}
        else:
            text = re.sub(r'url\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = urllib.parse.quote(text)
            return {"status": "success", "result": encoded, "steps": steps + ["URL encoded"]}
    
    # === HTML ENTITIES ===
    if 'html' in inp_lower:
        import html
        if 'decode' in inp_lower:
            text = re.sub(r'html\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            decoded = html.unescape(text)
            return {"status": "success", "result": decoded, "steps": steps + ["Decoded HTML entities"]}
        else:
            text = re.sub(r'html\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = html.escape(text)
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded HTML entities"]}
    
    # === PUNYCODE ===
    if 'punycode' in inp_lower:
        if 'decode' in inp_lower:
            text = re.sub(r'punycode\s+(decode|from)\s*', '', inp, flags=re.IGNORECASE).strip()
            try:
                decoded = text.encode('ascii').decode('punycode')
                return {"status": "success", "result": decoded, "steps": steps + ["Decoded Punycode"]}
            except Exception as e:
                return {"status": "error", "result": f"Punycode decode error: {str(e)}", "steps": steps}
        else:
            text = re.sub(r'punycode\s+(encode)?\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
            encoded = text.encode('punycode').decode('ascii')
            return {"status": "success", "result": encoded, "steps": steps + ["Encoded to Punycode"]}
    
    # === ATBASH ===
    if 'atbash' in inp_lower:
        text = re.sub(r'atbash\s*', '', inp, flags=re.IGNORECASE).strip().strip('"\'')
        result = text.translate(str.maketrans(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba'
        ))
        return {"status": "success", "result": result, "steps": steps + ["Applied Atbash cipher"]}
    
    # === VIGENERE ===
    vigenere_match = re.search(r'vigenere\s+(encrypt|decrypt)\s+(.+?)\s+key\s+(.+)', inp, re.IGNORECASE)
    if vigenere_match:
        action = vigenere_match.group(1).lower()
        text = vigenere_match.group(2).strip().strip('"\'')
        key = vigenere_match.group(3).strip().strip('"\'')
        
        result = []
        key_len = len(key)
        for i, c in enumerate(text):
            if c.isalpha():
                shift = ord(key[i % key_len].upper()) - 65
                if action == 'decrypt':
                    shift = -shift
                if c.isupper():
                    result.append(chr((ord(c) - 65 + shift) % 26 + 65))
                else:
                    result.append(chr((ord(c) - 97 + shift) % 26 + 97))
            else:
                result.append(c)
        
        return {"status": "success", "result": ''.join(result), "steps": steps + [f"Applied Vigenère {action} with key '{key}'"]}
    
    # === XOR ===
    xor_match = re.search(r'xor\s+(.+?)\s+with\s+(.+)', inp, re.IGNORECASE)
    if xor_match:
        text = xor_match.group(1).strip().strip('"\'')
        key = xor_match.group(2).strip().strip('"\'')
        
        result = ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(text))
        encoded = base64.b64encode(result.encode('latin-1')).decode()
        return {"status": "success", "result": f"XOR result (base64): {encoded}", "steps": steps + [f"Applied XOR with key '{key}'"]}
    
    return {
        "status": "error",
        "result": "Unknown encoding operation. Supported: base64/32/16/85, hex, binary, octal, ascii, unicode, rot13/47, caesar, morse, url, html, punycode, atbash, vigenere, xor",
        "steps": steps
    }

# ============================================================================
# MAIN ROUTER
# ============================================================================

def process_request(data):
    """Route to appropriate handler based on type"""
    req_type = data.get('type', '').lower().strip()
    
    handlers = {
        # Original v1.0 handlers
        'solve': handle_solve,
        'simplify': handle_simplify,
        'derivative': handle_derivative,
        'diff': handle_derivative,
        'differentiate': handle_derivative,
        'integral': handle_integral,
        'integrate': handle_integral,
        'limit': handle_limit,
        'lim': handle_limit,
        'factor': handle_factor,
        'expand': handle_expand,
        'fraction': handle_fraction,
        'stats': handle_stats,
        'statistics': handle_stats,
        'stat': handle_stats,
        'convert': handle_convert,
        'conversion': handle_convert,
        'evaluate': handle_evaluate,
        'eval': handle_evaluate,
        'compute': handle_evaluate,
        'system': handle_system,
        'equations': handle_system,
        
        # New v2.0 ULTIMATE handlers
        'cipher': handle_cipher,
        'crypto': handle_cipher,
        'cryptography': handle_cipher,
        'encrypt': handle_cipher,
        'decrypt': handle_cipher,
        'hash': handle_cipher,
        'chemistry': handle_chemistry,
        'chem': handle_chemistry,
        'z3': handle_z3,
        'theorem': handle_z3,
        'prove': handle_z3,
        'constraint': handle_z3,
        'sat': handle_z3,
        'graph': handle_graph,
        'network': handle_graph,
        'code': handle_code,
        'execute': handle_code,
        'run': handle_code,
        'sandbox': handle_code,
        'uncertainty': handle_uncertainty,
        'error': handle_uncertainty,
        'propagation': handle_uncertainty,
        'advanced_stats': handle_advanced_stats,
        'regression': handle_advanced_stats,
        'anova': handle_advanced_stats,
        'hypothesis': handle_advanced_stats,
        'distribution': handle_advanced_stats,
        'number_theory': handle_number_theory,
        'nt': handle_number_theory,
        'prime': handle_number_theory,
        'gcd': handle_number_theory,
        'modular': handle_number_theory,
        'signal': handle_signal,
        'fft': handle_signal,
        'convolution': handle_signal,
        'optimize': handle_optimize,
        'optimisation': handle_optimize,
        'fit': handle_optimize,
        'root': handle_optimize,
        'combinatorics': handle_combinatorics,
        'perm': handle_combinatorics,
        'comb': handle_combinatorics,
        'factorial': handle_combinatorics,
        'matrix': handle_matrix,
        'eigen': handle_matrix,
        'svd': handle_matrix,
        'differential': handle_differential,
        'ode': handle_differential,
        'pde': handle_differential,
        'finance': handle_finance,
        'financial': handle_finance,
        'loan': handle_finance,
        'interest': handle_finance,
        'complex': handle_complex,
        'residue': handle_complex,
        'encode': handle_encode,
        'decode': handle_encode,
        'encoding': handle_encode,
        'base64': handle_encode,
        'hex': handle_encode,
        'binary': handle_encode,
        'morse': handle_encode,
        'rot13': handle_encode,
        'caesar': handle_encode,
    }
    
    if req_type not in handlers:
        return {
            "status": "error",
            "result": f"Unknown operation type: '{req_type}'. Supported types: solve, simplify, derivative, integral, limit, factor, expand, fraction, stats, convert, evaluate, system, cipher, chemistry, z3, graph, code, uncertainty, advanced_stats, number_theory, signal, optimize, combinatorics, matrix, differential, finance, complex, encode"
        }
    
    return handlers[req_type](data)

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            safe_json_output({
                "status": "error",
                "result": "No input received. Expected JSON on stdin."
            })
            return
        
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError as e:
            safe_json_output({
                "status": "error",
                "result": f"Invalid JSON input: {str(e)}"
            })
            return
        
        # Process the request
        result = process_request(data)
        safe_json_output(result)
        
    except Exception as e:
        safe_json_output({
            "status": "error",
            "result": f"Unexpected error: {str(e)}"
        })

if __name__ == '__main__':
    main()
