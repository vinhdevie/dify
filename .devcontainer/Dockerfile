FROM mcr.microsoft.com/devcontainers/python:3.12

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libc-dev \
        libffi-dev \
        libgmp-dev \
        libmpfr-dev \
        libmpc-dev \
    && rm -rf /var/lib/apt/lists/*
    
# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>
