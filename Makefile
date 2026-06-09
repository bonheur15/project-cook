.PHONY: help dev build clean install

# Default target showing help
help:
	@echo "ForgeHub Development Makefile"
	@echo "----------------------------"
	@echo "Available commands:"
	@echo "  make dev      - Start ForgeHub in development mode (with live reloading)"
	@echo "  make build    - Compile the production binary"
	@echo "  make clean    - Remove built binaries and temporary build files"
	@echo "  make install  - Install frontend node dependencies"

# Start development server with live reloading
dev:
	GTK_CSD=0 GDK_BACKEND=x11 wails dev

# Build the production executable
build:
	GTK_CSD=0 GDK_BACKEND=x11 wails build

# Clean up build artifacts
clean:
	rm -rf build/bin/*

# Install npm dependencies
install:
	cd frontend && npm install
