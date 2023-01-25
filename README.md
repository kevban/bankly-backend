# Bank.ly Backend
The Express, Node and MongoDB based backend for the personal finance budgeting app Bank.ly.  

#### [Bank.ly Web App](https://github.com/kevban/bankly-front)  
#### [Bank.ly Mobile](https://github.com/kevban/bankly-mobile)  

## What does the Bank.ly do?

Bank.ly is a personal finance management tool that helps users keep track of their financial transactions and spending habits. By connecting to various financial institutions through the Plaid API, Bank.ly automatically pulls in bank transactions and allows users to easily add and edit them. Users can also create custom tags and categories to better organize their transactions and view detailed spending reports. Additionally, the app is designed to be cross-platform compatible, allowing users to access their financial information on the go.

## Installation

1. Clone the repository: `git clone https://github.com/kevban/bankly-backend.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

The backend will now be running on `http://localhost:3001`.

## Usage & Key Features

- User authentication and authorization using JSON Web Token (JWT)
- Password hashing and encryption (Bcrypt) for secure user data management
- Automatically pull transactions from financial institutions using [Plaid](https://plaid.com/)
- RESTful API for managing financial transactions and user data
- Request validation with Json Schema

## Technology Used
- Express, Node, MongoDB (Node driver)
- Bank API: Plaid

## Other
- This project was made for Springboard Capstone project 2
- Also see: 
  - [Bank.ly Mobile](https://github.com/kevban/bankly-mobile)
  - [Bankly Web](https://github.com/kevban/bankly-front)