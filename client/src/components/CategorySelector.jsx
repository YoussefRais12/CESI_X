import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const categories = [
  { label: 'All', icon: <AllInclusiveIcon /> },
  { label: 'Grocery', icon: <LocalGroceryStoreIcon /> },
  { label: 'Halal', icon: <RestaurantIcon /> },
  { label: 'Italian', icon: <LocalPizzaIcon /> },
  { label: 'Sushi', icon: <RiceBowlIcon /> },
  { label: 'Fast Food', icon: <FastfoodIcon /> },
  { label: 'Healthy', icon: <HealthAndSafetyIcon /> },
  { label: 'Burgers', icon: <LunchDiningIcon /> },
  { label: 'Asian', icon: <RiceBowlIcon /> },
  { label: 'Poke', icon: <RiceBowlIcon /> },
  { label: 'Thai', icon: <SoupKitchenIcon /> },
  { label: 'Korean', icon: <SoupKitchenIcon /> },
  { label: 'Breakfast', icon: <BreakfastDiningIcon /> },
];

const CategorySelector = ({ onSelectCategory }) => {
  return (
    <Box display="flex" overflow="auto" padding={2} className="category-selector">
      {categories.map((category, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          alignItems="center"
          marginX={2}
          onClick={() => {
            console.log(`Selected category: ${category.label}`);
            onSelectCategory(category.label);
          }}
          className="category-item"
        >
          <IconButton>{category.icon}</IconButton>
          <Typography variant="caption">{category.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CategorySelector;
