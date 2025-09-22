import Category from "../models/Category.js";
import mongoose from 'mongoose';

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ success: false, message: "Server error while fetching categories" });
    }
};

export const createCategory = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can add categories' });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const category = await Category.create({
            name,
            description,
            createdBy: user._id,
        });

        console.log('Category created successfully:', category);
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: 'Category with this name already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const categoryData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Category Id" });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Category Id" });
    }

    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}; 