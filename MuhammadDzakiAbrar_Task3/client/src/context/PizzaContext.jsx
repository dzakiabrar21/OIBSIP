import { createContext, useContext, useReducer } from 'react';

const PizzaContext = createContext(null);

export const usePizza = () => {
  const context = useContext(PizzaContext);
  if (!context) throw new Error('usePizza must be used within PizzaProvider');
  return context;
};

const initialState = {
  step: 0, // 0=base, 1=sauce, 2=cheese, 3=veggies, 4=review
  base: null,
  sauce: null,
  cheese: null,
  veggies: [],
  meat: [],
  totalPrice: 0,
};

const calcPrice = (state) => {
  let total = 0;
  if (state.base) total += state.base.price;
  if (state.sauce) total += state.sauce.price;
  if (state.cheese) total += state.cheese.price;
  state.veggies.forEach(v => total += v.price);
  state.meat.forEach(m => total += m.price);
  return total;
};

const pizzaReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'SET_BASE':
      newState = { ...state, base: action.payload };
      return { ...newState, totalPrice: calcPrice(newState) };
    case 'SET_SAUCE':
      newState = { ...state, sauce: action.payload };
      return { ...newState, totalPrice: calcPrice(newState) };
    case 'SET_CHEESE':
      newState = { ...state, cheese: action.payload };
      return { ...newState, totalPrice: calcPrice(newState) };
    case 'TOGGLE_VEGGIE': {
      const exists = state.veggies.find(v => v._id === action.payload._id);
      const veggies = exists
        ? state.veggies.filter(v => v._id !== action.payload._id)
        : [...state.veggies, action.payload];
      newState = { ...state, veggies };
      return { ...newState, totalPrice: calcPrice(newState) };
    }
    case 'TOGGLE_MEAT': {
      const exists = state.meat.find(m => m._id === action.payload._id);
      const meat = exists
        ? state.meat.filter(m => m._id !== action.payload._id)
        : [...state.meat, action.payload];
      newState = { ...state, meat };
      return { ...newState, totalPrice: calcPrice(newState) };
    }
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 4) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
};

export const PizzaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pizzaReducer, initialState);

  const setBase = (base) => dispatch({ type: 'SET_BASE', payload: base });
  const setSauce = (sauce) => dispatch({ type: 'SET_SAUCE', payload: sauce });
  const setCheese = (cheese) => dispatch({ type: 'SET_CHEESE', payload: cheese });
  const toggleVeggie = (veggie) => dispatch({ type: 'TOGGLE_VEGGIE', payload: veggie });
  const toggleMeat = (meat) => dispatch({ type: 'TOGGLE_MEAT', payload: meat });
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const reset = () => dispatch({ type: 'RESET' });

  const getOrderItems = () => ({
    base: state.base ? { item: state.base._id, name: state.base.name, price: state.base.price } : null,
    sauce: state.sauce ? { item: state.sauce._id, name: state.sauce.name, price: state.sauce.price } : null,
    cheese: state.cheese ? { item: state.cheese._id, name: state.cheese.name, price: state.cheese.price } : null,
    veggies: state.veggies.map(v => ({ item: v._id, name: v.name, price: v.price })),
    meat: state.meat.map(m => ({ item: m._id, name: m.name, price: m.price })),
  });

  return (
    <PizzaContext.Provider value={{
      ...state, setBase, setSauce, setCheese, toggleVeggie, toggleMeat,
      nextStep, prevStep, setStep, reset, getOrderItems,
    }}>
      {children}
    </PizzaContext.Provider>
  );
};
