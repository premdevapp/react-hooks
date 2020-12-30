import React, { useReducer, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should'nt get there!!");
  }
};

const httpReducer = (currHttpState, action) => {
  switch (action.type) {
    case "SEND_REQ":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...currHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorMessage };
    case "CLEAR":
      return { ...currHttpState, error: null };
    default:
      throw new Error("Should'nt get there!!");
  }
};

const Ingredients = () => {
  const [ingredientsState, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, httpDispatch] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  //const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState();

  /* useEffect(() => {
    fetch(
      "https://react-hooks-update-2c077-default-rtdb.firebaseio.com/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }
        setIngredientsState(loadedIngredients);
      });
  }, []);
 */
  useEffect(() => {
    console.log("Renderng ingredients", ingredientsState);
  }, [ingredientsState]);

  const addIngredientHandler = (ingredient) => {
    httpDispatch({ type: "SEND_REQ" });

    fetch(
      "https://react-hooks-update-2c077-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        httpDispatch({ type: "RESPONSE" });
        return response.json();
      })
      .then((responseData) => {
        /* setIngredientsState((prevState) => [
          ...prevState,
          { id: responseData.name, ...ingredient },
        ]); */

        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      })
      .catch((err) => {
        httpDispatch({ type: "ERROR", errorMessage: err.message });
      });
  };

  const removeIngredientHandler = (id) => {
    httpDispatch({ type: "SEND_REQ" });
    fetch(
      `https://react-hooks-update-2c077-default-rtdb.firebaseio.com/ingredients/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        httpDispatch({ type: "RESPONSE" });
        /*  setIngredientsState((prevState) =>
          prevState.filter((ing) => ing.id !== id)
        ); */
        dispatch({ type: "DELETE", id: id });
      })
      .catch((err) => {
        httpDispatch({ type: "ERROR", errorMessage: err.message });
      });
  };

  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    //setIngredientsState(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const clearError = () => {
    httpDispatch({ type: "CLEAR" });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        <IngredientList
          ingredients={ingredientsState}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
