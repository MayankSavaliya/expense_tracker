import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const SearchBar = ({ onSearch, initialValue = "" }) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search transactions by title, category, person..."
          className={`w-full pl-12 pr-12 py-3 rounded-lg border ${isFocused ? 'border-mint-500 ring-2 ring-mint-100' : 'border-gray-300'} focus:outline-none transition-all duration-200 shadow-sm`}
        />
        <div className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full ${
            isFocused ? "bg-mint-500 text-white" : "text-gray-400"
          } transition-all duration-200`}>
          <Icon
            name="Search"
            size={18}
          />
        </div>
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
          >
            <Icon name="X" size={16} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3.5 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-mint-100 p-2 rounded-full transition-all group-hover:bg-mint-50 hover:text-mint-600"
        >
          <Icon name="ArrowRight" size={18} className={isFocused ? "text-mint-500" : "text-gray-500"} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;