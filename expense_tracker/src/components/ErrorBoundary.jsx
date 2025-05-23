import React from "react";
import Icon from './AppIcon';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-error bg-opacity-10">
              <Icon name="AlertTriangle" className="text-error" size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but an unexpected error has occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-mint-500 hover:bg-mint-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-opacity-50"
            >
              Refresh the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;