import express from "express"
import { getSwiggyRestaurants, getSwiggyMenu } from "../controllers/swiggy.controllers.js"

const router = express.Router()

router.get("/restaurants", getSwiggyRestaurants)
router.get("/menu/:restaurantId", getSwiggyMenu)

export default router
