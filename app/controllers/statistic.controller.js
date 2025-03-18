const db = require("../models");
const sequelize = require("sequelize");
const {validationResult} = require("express-validator");
const User = db.user;
const deposit=db.deposit;
const bill= db.bill;

exports.statistic = async (req, res) => {
    const decryptedData = req.decryptedData;
    
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(200).json({
    //         status: 0,
    //         msg: 'Errors',
    //         errors: errors.array()
    //     });
    // }

    const userid = decryptedData.userId;
    const year = decryptedData.year;
    const mode = decryptedData.mode;

    try {
        const user = await User.findOne({
            where: {
                id: userid,
            },
        });

        if (!user) {
            return res.status(200).send({status: "0", message: "Kindly login your account."});
        }

        // Build the date filter based on mode
        let dateFilter = {};
        let attributes = [];
        let groupBy = [];
        let orderBy = '';

        switch (mode) {
            case "month":
                dateFilter = {
                    date: sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year)
                };
                attributes = [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%m-%Y'), 'month'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
                ];
                groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%m-%Y')];
                orderBy = 'DATE_FORMAT(date, "%m-%Y")';
                break;
            case "week":
                dateFilter = {
                    date: sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year)
                };
                attributes = [
                    [sequelize.fn('YEARWEEK', sequelize.col('date')), 'week'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
                ];
                groupBy = [sequelize.fn('YEARWEEK', sequelize.col('date'))];
                orderBy = 'YEARWEEK(date)';
                break;
            case "day":
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                dateFilter = {
                    date: {
                        [sequelize.Op.between]: [startOfWeek, endOfWeek]
                    }
                };
                attributes = [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%d-%m-%Y'), 'day'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
                ];
                groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%d-%m-%Y')];
                orderBy = 'DATE_FORMAT(date, "%d-%m-%Y")';
                break;
            case "year":
            default:
                attributes = [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y'), 'year'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
                ];
                groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y')];
                orderBy = 'DATE_FORMAT(date, "%Y")';
                break;
        }

        const deposits = await deposit.findAll({
            where: {
                username: user.username,
                ...dateFilter
            },
            attributes: attributes,
            group: groupBy,
            order: [[sequelize.literal(orderBy), 'ASC']]
        });

        const totaldeposit = await deposit.sum('amount', {
            where: {
                username: user.username,
                ...dateFilter
            },
        });

        const purchases = await bill.findAll({
            where: {
                username: user.username,
                ...dateFilter
            },
            attributes: attributes,
            group: groupBy,
            order: [[sequelize.literal(orderBy), 'ASC']]
        });

        const totalbill = await bill.sum('amount', {
            where: {
                username: user.username,
                ...dateFilter
            },
        });

        return res.status(200).send({
            status: 1,
            data: {
                income: deposits,
                totalincome: totaldeposit ?? 0,
                expense: purchases,
                totalexpense: totalbill ?? 0
            }
        });
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
};


