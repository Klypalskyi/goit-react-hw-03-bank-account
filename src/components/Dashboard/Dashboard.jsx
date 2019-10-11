import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import TransactionHistory from '../TransactionHistory/TransactionHistory';
import Controls from '../Controls/Controls';
import Balance from '../Balance/Balance';
import 'react-toastify/dist/ReactToastify.css';

const shortid = require('shortid');

const toastOptions = {
  position: 'bottom-right',
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

class Dashboard extends Component {
  state = {
    amount: '',
    transactions: [],
    totalDeposit: 0,
    totalWithdraw: 0,
  };

  componentDidMount() {
    if (localStorage.transactions) {
      const transactions = JSON.parse(localStorage.getItem('transactions'));
      const totalDeposit = [...transactions]
        .filter(transaction => transaction.type === 'Deposit')
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      const totalWithdraw = [...transactions]
        .filter(transaction => transaction.type === 'Withdraw')
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      const balance = totalDeposit - totalWithdraw;
      this.setState({
        transactions,
        totalDeposit,
        totalWithdraw,
        balance,
      });
    }
  }

  createTransaction = ({ target }) => {
    const { amount } = this.state;
    const newAmount = +amount;
    if (newAmount <= 0) {
      toast.error('Amount must be more then 0', toastOptions);
    } else {
      const transaction = {
        id: shortid.generate(),
        type: target.name,
        amount: newAmount,
        date: new Date().toLocaleString(),
      };
      this.setState(
        prev => ({
          id: '',
          type: '',
          amount: '',
          date: '',
          transactions: [...prev.transactions, transaction],
        }),
        () =>
          localStorage.setItem(
            'transactions',
            JSON.stringify(this.state.transactions),
          ),
      );
      if (transaction.type === 'Deposit') {
        this.setState(prev => ({
          totalDeposit: prev.totalDeposit + transaction.amount,
          balance: prev.totalDeposit + transaction.amount - prev.totalWithdraw,
        }));
      }
      if (transaction.type === 'Withdraw') {
        this.setState(prev => ({
          totalWithdraw: prev.totalWithdraw + transaction.amount,
          balance: prev.totalDeposit - transaction.amount - prev.totalWithdraw,
        }));
      }
    }
  };

  inputChange = ({ target }) => {
    const { value, name } = target;
    this.setState({ [name]: value });
  };

  render() {
    const {
      totalDeposit,
      balance,
      totalWithdraw,
      transactions,
      amount,
    } = this.state;
    return (
      <div className="DashboardWrapper">
        <Controls
          amount={amount}
          inputChange={this.inputChange}
          createTransaction={this.createTransaction}
        />
        <Balance
          balance={balance}
          deposit={totalDeposit}
          withdraw={totalWithdraw}
        />
        <TransactionHistory transactions={transactions} />
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />
      </div>
    );
  }
}

export default Dashboard;
