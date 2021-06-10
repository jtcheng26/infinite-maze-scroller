#!/bin/bash

# Compile main.cpp to WASM and generate js glue main.js
emcc main.cpp -s WASM=1 -o main.js