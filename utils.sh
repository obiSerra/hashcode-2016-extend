#!/usr/bin/env bash

 #echo -e | wc -l < data/out/simple.out | cat - data/out/simple.out > data/out/simple.tmp.out;

 #wc -l < data/out/simple.out

diff data/debug/redundancy-first-round data/debug/perf_redundancy.out

echo "diff ended"
