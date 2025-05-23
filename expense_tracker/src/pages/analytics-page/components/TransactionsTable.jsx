import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const TransactionsTable = () => {
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filter, setFilter] = useState("");

  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      title: "Grocery Shopping",
      category: "Food & Dining",
      amount: 85.50,
      date: "2023-05-20",
      user: {
        name: "Emily Johnson",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      group: "Roommates"
    },
    {
      id: 2,
      title: "Rent Payment",
      category: "Rent & Utilities",
      amount: 450.00,
      date: "2023-05-19",
      user: {
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      group: "Roommates"
    },
    {
      id: 3,
      title: "Dinner at Olive Garden",
      category: "Food & Dining",
      amount: 120.75,
      date: "2023-05-15",
      user: {
        name: "Sarah Wilson",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
      },
      group: "Weekend Trip"
    },
    {
      id: 4,
      title: "Movie Tickets",
      category: "Entertainment",
      amount: 45.00,
      date: "2023-05-12",
      user: {
        name: "David Lee",
        avatar: "https://randomuser.me/api/portraits/men/86.jpg"
      },
      group: "Weekend Trip"
    },
    {
      id: 5,
      title: "Gas",
      category: "Transportation",
      amount: 35.25,
      date: "2023-05-10",
      user: {
        name: "Michael Brown",
        avatar: "https://randomuser.me/api/portraits/men/59.jpg"
      },
      group: "Roommates"
    },
    {
      id: 6,
      title: "Amazon Purchase",
      category: "Shopping",
      amount: 67.99,
      date: "2023-05-08",
      user: {
        name: "Jessica Taylor",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg"
      },
      group: "Personal"
    },
    {
      id: 7,
      title: "Electricity Bill",
      category: "Rent & Utilities",
      amount: 95.30,
      date: "2023-05-05",
      user: {
        name: "John Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      group: "Roommates"
    }
  ];

  // Sort and filter transactions
  const sortedTransactions = [...transactions]
    .filter(transaction => {
      if (!filter) return true;
      return (
        transaction.title.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filter.toLowerCase()) ||
        transaction.group.toLowerCase().includes(filter.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-mint-500 focus:border-mint-500 focus:ring-2 focus:outline-none"
          />
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  <span>Title</span>
                  {sortField === "title" && (
                    <Icon
                      name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className="ml-1"
                    />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  <span>Category</span>
                  {sortField === "category" && (
                    <Icon
                      name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className="ml-1"
                    />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  <span>Amount</span>
                  {sortField === "amount" && (
                    <Icon
                      name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className="ml-1"
                    />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortField === "date" && (
                    <Icon
                      name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className="ml-1"
                    />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Paid By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                  <div className="text-sm text-gray-500">{transaction.group}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={transaction.user.avatar}
                        alt={transaction.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user.name}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTransactions.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Search" size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;