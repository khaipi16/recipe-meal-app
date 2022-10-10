import React, {useContext, useEffect, useState} from "react";
import axios from 'axios';

const AppContext = React.createContext()

const searchMealsURL = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const randomMealsURL = 'https://www.themealdb.com/api/json/v1/1/random.php'

const getFavoritesFromLocalStorage = () =>{
    let favorites = localStorage.getItem('favorites');
    if(favorites){
        favorites = JSON.parse(localStorage.getItem('favorites'))
    }
    else{
        favorites = []
    }
    return favorites
}

const AppProvider = ({children}) =>{
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [meals, setMeals] = useState([])

    const [showModal, setShowModal] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [favorites, setFavorites] = useState(getFavoritesFromLocalStorage)

    const fetchMealsData = async (url) =>{
        setLoading(true)
        try{
            const {data} = await axios.get(url)
            if(data.meals){
                setMeals(data.meals)
            }
            else{
                setMeals([])
            }
        }
        catch (error){
            console.log(error.response)
        }
        setLoading(false)
    }

    const fetchRandomMeal = () =>{
        fetchMealsData(randomMealsURL)
    }

    const selectMeal = (idMeal, favoriteMeal) =>{
        let meal;
        if(favoriteMeal){
            meal = favorites.find((meal) => meal.idMeal === idMeal);
        }
        else{
            meal = meals.find((meal) => meal.idMeal === idMeal);
        }
        setSelectedMeal(meal);
        setShowModal(true);
    }

    const addFavorites = (idMeal) =>{
        const meal = meals.find((meal) => meal.idMeal === idMeal)
        const alreadyFavorite = favorites.find(meal => meal.idMeal == idMeal)
        if(alreadyFavorite) return //do nothing if it's already favorited
        const updatedFavorites = [...favorites, meal];
        setFavorites(updatedFavorites)
        localStorage.setItem( 'favorites', JSON.stringify(updatedFavorites))
    }

    const removeFavorites = (idMeal) =>{
        const updatedFavorites = favorites.filter((meal) => meal.idMeal !== idMeal);
        setFavorites(updatedFavorites)
        localStorage.setItem( 'favorites', JSON.stringify(updatedFavorites))
    }



    const closeModal = () =>{
        setShowModal(false)
    }

    useEffect(() =>{
        fetchMealsData(searchMealsURL)
        }, [])

    useEffect(() =>{
        if(!searchTerm) return

        fetchMealsData(`${searchMealsURL}${searchTerm}`)
        }, [searchTerm])



    return <AppContext.Provider value={{loading, meals, setSearchTerm, fetchRandomMeal, showModal, 
        selectedMeal, selectMeal, closeModal, addFavorites, removeFavorites, favorites}}>
        {children}
    </AppContext.Provider>
}

export const useGlobalContext = () =>{
    return useContext(AppContext)
}




export {AppContext, AppProvider};