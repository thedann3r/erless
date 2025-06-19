#!/bin/bash
# Erlessed Healthcare Platform - Production Deployment Script

set -e

echo "🏥 Erlessed Healthcare Platform - Production Deployment"
echo "=================================================="

# Check if required tools are installed
check_dependencies() {
    local deps=("docker" "fly" "git")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo "❌ $dep is not installed. Please install it first."
            exit 1
        fi
    done
    echo "✅ All dependencies are available"
}

# Build and test the application
build_and_test() {
    echo "📦 Building application..."
    npm run build
    
    echo "🧪 Running health checks..."
    # Add your test commands here
    # npm test
    
    echo "🐳 Building Docker image..."
    docker build -t erlessed-healthcare:latest .
    
    echo "✅ Build completed successfully"
}

# Deploy to Fly.io
deploy_fly() {
    echo "🚀 Deploying to Fly.io..."
    
    # Ensure fly app exists
    if ! fly apps list | grep -q "erlessed-healthcare"; then
        echo "📱 Creating Fly.io app..."
        fly apps create erlessed-healthcare --region jnb
    fi
    
    # Set secrets
    echo "🔐 Setting environment variables..."
    if [ -f ".env.production" ]; then
        while IFS= read -r line; do
            if [[ $line =~ ^[A-Z_]+=.+ ]]; then
                key=$(echo "$line" | cut -d'=' -f1)
                value=$(echo "$line" | cut -d'=' -f2-)
                fly secrets set "$key=$value" --app erlessed-healthcare
            fi
        done < .env.production
    else
        echo "⚠️  .env.production file not found. Please set secrets manually:"
        echo "   fly secrets set DATABASE_URL=your_db_url --app erlessed-healthcare"
        echo "   fly secrets set OPENAI_API_KEY=your_key --app erlessed-healthcare"
        echo "   fly secrets set JWT_SECRET=your_secret --app erlessed-healthcare"
    fi
    
    # Deploy
    fly deploy --app erlessed-healthcare
    
    echo "✅ Deployed to Fly.io successfully"
    fly open --app erlessed-healthcare
}

# Deploy to Render.com
deploy_render() {
    echo "🚀 Deploying to Render.com..."
    
    # Check if render-cli is available
    if ! command -v render &> /dev/null; then
        echo "📥 Installing Render CLI..."
        npm install -g @renderinc/cli
    fi
    
    # Deploy using blueprint
    render deploy --file render.yaml
    
    echo "✅ Deployed to Render.com successfully"
}

# Setup monitoring
setup_monitoring() {
    echo "📊 Setting up monitoring..."
    
    # Start uptime monitor in background
    if [ -f "uptime-monitor.js" ]; then
        echo "🔍 Starting uptime monitor..."
        MONITOR_URL="https://erlessed-healthcare.fly.dev" node uptime-monitor.js &
        echo $! > monitor.pid
        echo "✅ Uptime monitor started (PID: $(cat monitor.pid))"
    fi
    
    echo "📈 Monitor your application at:"
    echo "   Health: https://erlessed-healthcare.fly.dev/health"
    echo "   Metrics: https://erlessed-healthcare.fly.dev/metrics"
}

# Main deployment function
main() {
    echo "Select deployment target:"
    echo "1) Fly.io (Recommended for Africa)"
    echo "2) Render.com"
    echo "3) Both"
    echo "4) Local monitoring only"
    
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            check_dependencies
            build_and_test
            deploy_fly
            setup_monitoring
            ;;
        2)
            check_dependencies
            build_and_test
            deploy_render
            setup_monitoring
            ;;
        3)
            check_dependencies
            build_and_test
            deploy_fly
            deploy_render
            setup_monitoring
            ;;
        4)
            setup_monitoring
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure your domain DNS"
    echo "   2. Set up SSL certificates"
    echo "   3. Configure backup schedules"
    echo "   4. Set up alerts and monitoring"
    echo ""
    echo "🔗 Useful links:"
    echo "   Application: https://erlessed-healthcare.fly.dev"
    echo "   Health Check: https://erlessed-healthcare.fly.dev/health"
    echo "   Metrics: https://erlessed-healthcare.fly.dev/metrics"
}

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    if [ -f "monitor.pid" ]; then
        kill $(cat monitor.pid) 2>/dev/null || true
        rm monitor.pid
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"