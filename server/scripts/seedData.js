import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Transaction from '../models/Transaction.js';

// Test users data
const TEST_USERS = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123' },
  { name: 'Diana Wilson', email: 'diana@example.com', password: 'password123' },
  { name: 'Eric Davis', email: 'eric@example.com', password: 'password123' }
];

const seedData = async () => {
  try {
    console.log('Starting seed process...');
    
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/split';
    console.log('Attempting to connect to MongoDB at:', MONGO_URI);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.once('open', () => {
      console.log('MongoDB connection opened successfully');
    });

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Expense.deleteMany({}),
      Transaction.deleteMany({})
    ]);

    // Create test users
    console.log('Creating test users...');
    const createdUsers = [];
    
    for (const userData of TEST_USERS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        friends: []  // Initialize empty friends array
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Test user created: ${savedUser.name} (${savedUser.email})`);
    }

    // Create friend connections
    const [alice, bob, charlie, diana, eric] = createdUsers;

    // Make Alice and Bob friends
    alice.friends.push(bob._id);
    bob.friends.push(alice._id);
    await alice.save();
    await bob.save();
    console.log(`Created friendship: ${alice.name} <-> ${bob.name}`);

    // Make Alice and Charlie friends
    alice.friends.push(charlie._id);
    charlie.friends.push(alice._id);
    await alice.save();
    await charlie.save();
    console.log(`Created friendship: ${alice.name} <-> ${charlie.name}`);

    // Make Bob and Diana friends
    bob.friends.push(diana._id);
    diana.friends.push(bob._id);
    await bob.save();
    await diana.save();
    console.log(`Created friendship: ${bob.name} <-> ${diana.name}`);

    // Create test groups
    console.log('\nCreating test groups...');
    const createdGroups = [];

    // Weekend Trip group (Alice, Bob, Charlie)
    const weekendTripGroup = new Group({
      name: 'Weekend Trip',
      description: 'Expenses from our weekend getaway',
      category: 'Travel',
      creator: alice._id,
      members: [alice._id, bob._id, charlie._id]
    });
    const savedWeekendTrip = await weekendTripGroup.save();
    createdGroups.push(savedWeekendTrip);
    console.log(`Created group: ${savedWeekendTrip.name}`);

    // House Expenses group (Bob, Diana, Eric)
    const houseGroup = new Group({
      name: 'House Expenses',
      description: 'Shared housing costs and utilities',
      category: 'Housing',
      creator: bob._id,
      members: [bob._id, diana._id, eric._id]
    });
    const savedHouseGroup = await houseGroup.save();
    createdGroups.push(savedHouseGroup);
    console.log(`Created group: ${savedHouseGroup.name}`);

    // Create test expenses
    console.log('\nCreating test expenses...');

    // Weekend Trip expenses
    const weekendExpenses = [
      {
        description: 'Hotel Booking',
        amount: 600,
        paidBy: [{ user: alice._id, amount: 600 }],
        splitType: 'equal',
        category: 'Travel',
        group: savedWeekendTrip._id,
        createdBy: alice._id,
        date: new Date('2024-01-15'),
        notes: 'Two nights at Mountain Resort'
      },
      {
        description: 'Group Dinner',
        amount: 150,
        paidBy: [{ user: bob._id, amount: 150 }],
        splitType: 'equal',
        category: 'Food & Drink',
        group: savedWeekendTrip._id,
        createdBy: bob._id,
        date: new Date('2024-01-16'),
        notes: 'Restaurant dinner during trip'
      }
    ];

    // House Expenses
    const houseExpenses = [
      {
        description: 'Monthly Rent',
        amount: 1500,
        paidBy: [{ user: bob._id, amount: 1500 }],
        splitType: 'equal',
        category: 'Housing',
        group: savedHouseGroup._id,
        createdBy: bob._id,
        date: new Date('2024-01-01'),
        notes: 'January rent'
      },
      {
        description: 'Utilities',
        amount: 300,
        paidBy: [{ user: diana._id, amount: 300 }],
        splitType: 'equal',
        category: 'Utilities',
        group: savedHouseGroup._id,
        createdBy: diana._id,
        date: new Date('2024-01-05'),
        notes: 'Electricity and water bill'
      }
    ];

    // Non-group expenses between friends
    const friendExpenses = [
      {
        description: 'Movie Night',
        amount: 40,
        paidBy: [{ user: alice._id, amount: 40 }],
        splitType: 'equal',
        category: 'Entertainment',
        createdBy: alice._id,
        date: new Date('2024-01-10'),
        notes: 'Movie tickets'
      },
      {
        description: 'Lunch',
        amount: 25,
        paidBy: [{ user: bob._id, amount: 25 }],
        splitType: 'equal',
        category: 'Food & Drink',
        createdBy: bob._id,
        date: new Date('2024-01-12'),
        notes: 'Casual lunch meetup'
      }
    ];

    // Create owedBy arrays and save expenses
    for (const expense of [...weekendExpenses, ...houseExpenses, ...friendExpenses]) {
      const totalAmount = expense.amount;
      let participants;

      if (expense.group) {
        // For group expenses, get members from the group
        const group = createdGroups.find(g => g._id.equals(expense.group));
        participants = group.members;
      } else {
        // For friend expenses, use the payer and first friend
        const payer = expense.paidBy[0].user;
        const friend = payer.equals(alice._id) ? bob._id : alice._id;
        participants = [payer, friend];
      }

      // Calculate equal share
      const shareAmount = parseFloat((totalAmount / participants.length).toFixed(2));
      
      // Create owedBy array with equal shares
      expense.owedBy = participants.map(userId => ({
        user: userId,
        amount: shareAmount
      }));

      // Calculate and set userBalances
      const userBalancesTemp = {};
      
      // Initialize balances for all participants
      participants.forEach(userId => {
        userBalancesTemp[userId] = { paid: 0, owed: 0 };
      });

      // Add amounts paid
      expense.paidBy.forEach(payer => {
        userBalancesTemp[payer.user].paid += payer.amount;
      });

      // Add amounts owed
      expense.owedBy.forEach(debtor => {
        userBalancesTemp[debtor.user].owed += debtor.amount;
      });

      // Convert to final format
      expense.userBalances = Object.entries(userBalancesTemp).map(([userId, balance]) => ({
        user: userId,
        balance: parseFloat((balance.paid - balance.owed).toFixed(2))
      }));

      // Save the expense - this will trigger transaction creation/update
      const savedExpense = await Expense.create(expense);
      console.log(`Created expense: ${savedExpense.description} ($${savedExpense.amount})`);
    }

    console.log('\nSeed completed successfully!');
    console.log(`Created:
- ${createdUsers.length} users
- ${createdGroups.length} groups
- ${[...weekendExpenses, ...houseExpenses, ...friendExpenses].length} expenses`);

  } catch (error) {
    console.error('Error during seed process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function immediately
console.log('Starting seed script...');
seedData().catch(error => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
