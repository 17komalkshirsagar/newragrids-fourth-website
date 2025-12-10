const User = require("../models/EPC");
const bcrypt = require("bcryptjs");
const { cloudinary } = require("../utils/cloudinary.config");
const { Upload } = require("../utils/upload");
const fs = require("fs");
const path = require("path");

// exports.addSolarFarm = async (req, res) => {
//     try {
//         Upload(req, res, async (err) => {
//             if (err) return res.status(400).json({ error: err.message });

//             const epcId = req.params.id;

//             let {
//                 projectName,
//                 location,
//                 capacity,
//                 substation,
//                 distanceFromSubstation,
//                 landOwnership,
//                 statusOfFarm,
//                 statusOfLoan,
//                 regulatoryStatus,
//                 tariffExpected,
//                 expectedCommissioningTimeline
//             } = req.body;

//             // ⭐ CONVERT STRING JSON → OBJECT
//             if (location) location = JSON.parse(location);
//             if (capacity) capacity = JSON.parse(capacity);
//             if (substation) substation = JSON.parse(substation);
//             if (expectedCommissioningTimeline)
//                 expectedCommissioningTimeline = JSON.parse(expectedCommissioningTimeline);

//             // FILE CHECK
//             const landFile = req.files?.find(
//                 (f) => f.fieldname === "landDocument"
//             );

//             if (!landFile) {
//                 return res.status(400).json({
//                     message: "landDocument file is required!"
//                 });
//             }

//             // CLOUDINARY UPLOAD LOGIC (same as your reference)
//             const uploadFile = () => {
//                 return new Promise((resolve, reject) => {
//                     const stream = cloudinary.uploader.upload_stream(
//                         {
//                             resource_type:
//                                 path.extname(landFile.originalname).toLowerCase() === ".pdf"
//                                     ? "raw"
//                                     : "auto",
//                         },
//                         (error, result) => {
//                             if (error) return reject(error);
//                             resolve(result.secure_url);
//                         }
//                     );

//                     fs.createReadStream(landFile.path).pipe(stream);
//                 });
//             };

//             const fileUrl = await uploadFile();

//             // SUBSTATION LOGIC
//             let finalSubstation = {};

//             if (substation.category === "MSEDCL") {
//                 finalSubstation = {
//                     category: "MSEDCL",
//                     taluka: substation.taluka,
//                     district: null,
//                     substation: substation.substation
//                 };
//             }

//             if (substation.category === "MSETCL") {
//                 finalSubstation = {
//                     category: "MSETCL",
//                     district: substation.district,
//                     taluka: null,
//                     substation: substation.substation
//                 };
//             }

//             // FIND EPC USER
//             const epcUser = await User.findById(epcId);
//             if (!epcUser) {
//                 return res.status(404).json({
//                     message: "EPC User Not Found"
//                 });
//             }

//             // CREATE FARM OBJECT
//             const newFarm = {
//                 projectName,
//                 location,
//                 capacity,
//                 substation: finalSubstation,
//                 distanceFromSubstation,
//                 landOwnership,

//                 landDocument: {
//                     fileUrl,
//                     fileType: landOwnership
//                 },

//                 statusOfFarm,
//                 statusOfLoan,
//                 regulatoryStatus,
//                 tariffExpected,
//                 expectedCommissioningTimeline
//             };

//             // PUSH INTO ARRAY
//             epcUser.solarFarms.push(newFarm);

//             await epcUser.save();

//             return res.status(201).json({
//                 message: "Solar Farm Added Successfully",
//                 farms: epcUser.solarFarms
//             });
//         });
//     } catch (error) {
//         console.error("Solar Farm Add Error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

exports.addSolarFarm = async (req, res) => {
    try {
        Upload(req, res, async (err) => {
            if (err) return res.status(400).json({ error: err.message });

            const epcId = req.params.id;

            // farms हा array येईल
            let { farms } = req.body;

            // Parse because form-data मध्ये JSON string येतो
            farms = JSON.parse(farms);

            // FIND EPC USER
            const epcUser = await User.findById(epcId);
            if (!epcUser) {
                return res.status(404).json({ message: "EPC User Not Found" });
            }

            // Loop each farm
            for (let i = 0; i < farms.length; i++) {

                let {
                    projectName,
                    location,
                    capacity,
                    substation,
                    distanceFromSubstation,
                    landOwnership,
                    statusOfFarm,
                    statusOfLoan,
                    regulatoryStatus,
                    tariffExpected,
                    expectedCommissioningTimeline
                } = farms[i];

                if (location) location = JSON.parse(location);
                if (capacity) capacity = JSON.parse(capacity);
                if (substation) substation = JSON.parse(substation);
                if (expectedCommissioningTimeline)
                    expectedCommissioningTimeline = JSON.parse(expectedCommissioningTimeline);

                const landFile = req.files?.find(
                    (f) => f.fieldname === `landDocument_${i}`
                );

                if (!landFile) {
                    return res.status(400).json({
                        message: `landDocument ${i} file is required`
                    });
                }

                // Upload to cloudinary
                const uploadFile = () => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                resource_type:
                                    path.extname(landFile.originalname).toLowerCase() === ".pdf"
                                        ? "raw"
                                        : "auto",
                            },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );

                        fs.createReadStream(landFile.path).pipe(stream);
                    });
                };

                const fileUrl = await uploadFile();

                // Substation Logic
                let finalSubstation = {};
                if (substation.category === "MSEDCL") {
                    finalSubstation = {
                        category: "MSEDCL",
                        taluka: substation.taluka,
                        district: null,
                        substation: substation.substation
                    };
                } else if (substation.category === "MSETCL") {
                    finalSubstation = {
                        category: "MSETCL",
                        district: substation.district,
                        taluka: null,
                        substation: substation.substation
                    };
                }

                // Push farm
                // epcUser.solarFarms.push({
                //     projectName,
                //     location,
                //     capacity,
                //     substation: finalSubstation,
                //     distanceFromSubstation,
                //     landOwnership,
                //     landDocument: {
                //         fileUrl,
                //         fileType: landOwnership
                //     },
                //     statusOfFarm,
                //     statusOfLoan,
                //     regulatoryStatus,
                //     tariffExpected,
                //     expectedCommissioningTimeline
                // });


                // VALIDATE ENUMS
                if (!["OWN", "LEASE"].includes(landOwnership)) {
                    landOwnership = null;
                }

                let fileType = farms[i]?.landDocument?.fileType;
                if (!["OWN", "LEASE"].includes(fileType)) {
                    fileType = landOwnership;
                }

                // Push final farm object
                epcUser.solarFarms.push({
                    projectName,
                    location,
                    capacity,
                    substation: finalSubstation,
                    distanceFromSubstation,
                    landOwnership,
                    landDocument: {
                        fileUrl,
                        fileType
                    },
                    statusOfFarm,
                    statusOfLoan,
                    regulatoryStatus,
                    tariffExpected,
                    expectedCommissioningTimeline
                });


            }

            // Save after loop
            await epcUser.save();

            res.status(201).json({
                message: "All Solar Farms Added Successfully",
                farms: epcUser.solarFarms
            });

        });

    } catch (error) {
        console.error("Multi Solar Farm Add Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getEpcProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "EPC User Not Found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile Fetched Successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};