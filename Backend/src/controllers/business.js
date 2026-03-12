import Business from "../models/business.js";
import User from "../models/user.js";
import path from 'path';

export const createBusiness = async (req, res) => {

    try {
        const { name, description, category, address, phone } = req.body;

        if (!name || !description || !category || !address || !phone) {
            return res.status(400).json({ message: 'please fill the given fields' })
        }

        const existingBusiness = await Business.findOne({ owner: req.user._id });
        if (existingBusiness) {
            return res.status(400).json({ message: 'You already own a business' });
        }

        let coverImage= "";
        let images = [];

        if(req.files){
            if(req.files.coverImage){
                coverImage=req.files.coverImage.path;
            }
            if(req.files.images){
                images=req.files.images.map(file=> file.path)
            }
        }

        const newBusiness = await Business.create({
            name: name,
            description: description,
            category: category,
            address: address,
            phone: phone,
            coverImage: coverImage,
            images: images ,
            owner: req.user._id,
        })

        await User.findByIdAndUpdate(req.user._id, {
            role: 'manager',
            businessId: newBusiness._id
        });
        res.status(201).json({
            success: true,
            data: newBusiness
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}


export const getBusinesses = async (req, res) => {
  try {
    let queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    if (req.query.search) {
        const keyword = req.query.search;
        queryObj.$or = [
            { name: { $regex: keyword, $options: 'i' } },       
            { category: { $regex: keyword, $options: 'i' } },
            { city: { $regex: keyword, $options: 'i' } }
        ];
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Business.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1; 
    const limit = parseInt(req.query.limit, 10) || 10; 
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const businesses = await query;
    const total = await Business.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      success: true,
      count: businesses.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      },
      data: businesses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id); 
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBusiness = async (req, res) => {

    try {
       let business = await Business.findById(req.params.id);

       if(!business){
        return res.status(404).json({message : 'this business do not exist'})
       }

       if(business.owner.toString() !== req.user._id.toString()){
        return res.status(403).json({message : 'you are not allowed to make changes'})
       }


        const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, req.body,{
            new : true ,
            runValidators: true
        })

        res.status(201).json({
            success: true,
            data: updatedBusiness
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

export const deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        if (business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await business.deleteOne();

        // 2. FUTURE STEP: Cascade Delete Services
        // When you build the Service model later, uncomment the line below:
        // await Service.deleteMany({ businessId: business._id });

        res.status(200).json({ success: true, data: {} });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(
            req.params.id, 
            { isVerified: true }, 
            { new: true, runValidators: true }
        );

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Business has been verified and is now public.',
            data: business
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};