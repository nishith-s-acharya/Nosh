export const getSwiggyRestaurants = async (req, res) => {
    try {
        const { lat = "12.9716", lng = "77.5946" } = req.query

        const response = await fetch(
            `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&page_type=DESKTOP_WEB_LISTING`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                }
            }
        )

        const data = await response.json()
        const cards = data?.data?.cards || []

        let topRestaurants = []
        let gridRestaurants = []

        for (const card of cards) {
            const cardData = card?.card?.card
            const infoWithStyle = cardData?.gridElements?.infoWithStyle

            // Only pick cards that have actual restaurant objects (with .info.id and .info.name)
            // Skip category/banner cards which have imageGridCards or ImageInfoLayoutCard type
            if (!infoWithStyle) continue

            const restaurants = infoWithStyle?.restaurants
            if (!restaurants || restaurants.length === 0) continue

            // Verify first item actually has restaurant info structure
            const firstItem = restaurants[0]
            const hasRestaurantInfo = firstItem?.info?.id && firstItem?.info?.name && firstItem?.info?.cloudinaryImageId
            if (!hasRestaurantInfo) continue

            if (topRestaurants.length === 0) {
                topRestaurants = restaurants
            } else if (gridRestaurants.length === 0) {
                gridRestaurants = restaurants
            }
        }

        // If only one set found, use it for both
        if (gridRestaurants.length === 0 && topRestaurants.length > 0) {
            gridRestaurants = topRestaurants
        }

        const formatRestaurant = (r) => ({
            id: r.info.id,
            name: r.info.name,
            image: `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${r.info.cloudinaryImageId}`,
            locality: r.info.locality,
            areaName: r.info.areaName,
            costForTwo: r.info.costForTwo,
            cuisines: r.info.cuisines,
            avgRating: r.info.avgRating,
            avgRatingString: r.info.avgRatingString,
            totalRatingsString: r.info.totalRatingsString,
            deliveryTime: r.info.sla?.deliveryTime,
            slaString: r.info.sla?.slaString,
            discount: r.info.aggregatedDiscountInfoV3?.header || "",
            discountSubHeader: r.info.aggregatedDiscountInfoV3?.subHeader || "",
            isOpen: r.info.isOpen,
            veg: r.info.veg || false,
        })

        const topFormatted = topRestaurants.map(formatRestaurant)
        const gridFormatted = gridRestaurants.map(formatRestaurant)

        return res.status(200).json({
            topRestaurants: topFormatted,
            allRestaurants: gridFormatted,
        })
    } catch (error) {
        console.log("Swiggy API error:", error)
        return res.status(500).json({ message: "Failed to fetch restaurants from Swiggy" })
    }
}

export const getSwiggyMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const { lat = "12.9716", lng = "77.5946" } = req.query

        // Use /mapi/ (mobile API) instead of /dapi/ — bypasses 202 bot detection
        const menuUrl = `https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${restaurantId}`

        const response = await fetch(menuUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            }
        })

        if (response.status !== 200) {
            return res.status(502).json({ message: "Swiggy menu temporarily unavailable" })
        }

        const data = await response.json()



        // Extract restaurant info
        const restaurantInfo = data?.data?.cards?.find(c =>
            c?.card?.card?.["@type"]?.includes("food.v2.Restaurant")
        )?.card?.card?.info || {}

        // Extract menu categories from the groupedCard
        const menuCards = data?.data?.cards?.find(c => c?.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR?.cards || []

        const categories = []

        for (const card of menuCards) {
            const cardInfo = card?.card?.card
            // ItemCategory contains direct items
            if (cardInfo?.["@type"]?.includes("ItemCategory")) {
                const categoryItems = (cardInfo.itemCards || []).map(ic => {
                    const item = ic?.card?.info
                    if (!item) return null
                    return {
                        id: item.id,
                        name: item.name,
                        price: (item.price || item.defaultPrice || 0) / 100,
                        description: item.description || "",
                        image: item.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.imageId}` : null,
                        foodType: item.itemAttribute?.vegClassifier === "VEG" ? "veg" : "non-veg",
                        rating: item.ratings?.aggregatedRating?.rating || null,
                        ratingCount: item.ratings?.aggregatedRating?.ratingCountV2 || "0",
                        inStock: item.inStock !== false,
                    }
                }).filter(Boolean)

                if (categoryItems.length > 0) {
                    categories.push({
                        title: cardInfo.title,
                        items: categoryItems
                    })
                }
            }

            // NestedItemCategory contains subcategories
            if (cardInfo?.["@type"]?.includes("NestedItemCategory")) {
                const subCategories = cardInfo.categories || []
                for (const sub of subCategories) {
                    const subItems = (sub.itemCards || []).map(ic => {
                        const item = ic?.card?.info
                        if (!item) return null
                        return {
                            id: item.id,
                            name: item.name,
                            price: (item.price || item.defaultPrice || 0) / 100,
                            description: item.description || "",
                            image: item.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300/${item.imageId}` : null,
                            foodType: item.itemAttribute?.vegClassifier === "VEG" ? "veg" : "non-veg",
                            rating: item.ratings?.aggregatedRating?.rating || null,
                            ratingCount: item.ratings?.aggregatedRating?.ratingCountV2 || "0",
                            inStock: item.inStock !== false,
                        }
                    }).filter(Boolean)

                    if (subItems.length > 0) {
                        categories.push({
                            title: `${cardInfo.title} - ${sub.title}`,
                            items: subItems
                        })
                    }
                }
            }
        }

        const restaurant = {
            id: restaurantInfo.id,
            name: restaurantInfo.name,
            image: restaurantInfo.cloudinaryImageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${restaurantInfo.cloudinaryImageId}` : null,
            locality: restaurantInfo.locality,
            areaName: restaurantInfo.areaName,
            city: restaurantInfo.city,
            costForTwoMessage: restaurantInfo.costForTwoMessage,
            cuisines: restaurantInfo.cuisines,
            avgRating: restaurantInfo.avgRating,
            avgRatingString: restaurantInfo.avgRatingString,
            totalRatingsString: restaurantInfo.totalRatingsString,
            slaString: restaurantInfo.sla?.slaString,
        }

        return res.status(200).json({ restaurant, categories })
    } catch (error) {
        console.log("Swiggy Menu API error:", error)
        return res.status(500).json({ message: "Failed to fetch menu from Swiggy" })
    }
}
