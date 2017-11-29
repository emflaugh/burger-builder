import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';


const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {...}
    // }
    state = {
        ingredients: {
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        }, 
        totalPrice: 4,
        purchaseable: false,
        purchasing: false,
        loading: false
    }

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
        .map(igKey => {
            return ingredients[igKey];
        })
        .reduce((sum, el) => {
            return sum + el;
        }, 0)
        this.setState({purchasable: sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients})
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) {
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({ totalPrice: newPrice, ingredients: updatedIngredients })
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        // alert('You Continue!');
        this.setState({loading: true});
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Elyse Flaugher',
                address: {
                    street: '2525 N Connecticut Ave.',
                    city: 'Royal Oak',
                    state: 'Michigan',
                    zipCode: '48073',
                    country: 'USA'
                },
                email: 'elyseflaugher@gmail.com',
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order)
        .then( response => {
            this.setState({loading: false, purchasing: false});
        })
        .catch(error => {
            this.setState({loading: false, purchasing: false});
        });
    }

    render() {
        const disableInfo = {
            ...this.state.ingredients
        };
        for (let key in disableInfo) {
            disableInfo[key] = disableInfo[key] <= 0 
        }
        let orderSummary = <OrderSummary
            purchaseCancelled={this.purchaseCancelHandler}
            purchaseContinue={this.purchaseContinueHandler}
            price={this.state.totalPrice}
            ingredients={this.state.ingredients} />
        if (this.state.loading) {
            orderSummary = <Spinner />
        }
        return(
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                <Burger ingredients={this.state.ingredients}/>
                <BuildControls 
                ingredientAdded={this.addIngredientHandler} 
                ingredientRemoved={this.removeIngredientHandler}
                disabled={disableInfo}
                purchasable={this.state.purchasable}
                ordered={this.purchaseHandler}
                price={this.state.totalPrice} />
            </Aux>
        ); 
    }
}

export default BurgerBuilder;