const express = require('express');
const sequelize = require('sequelize')
const { Diary } = require('../models');// index는 파일 이름 생략 가능 

const router = express.Router();

// 글 작성
router.post('/:user_id/:ques_id', async (req, res) => {
  try {
    const diary = await Diary.create({
      userId : req.params.user_id,
      quesId : req.params.ques_id,
      ...req.body
    });
    // diary가 있다면 - 예외처리
    if(diary) {
      return res.status(201).json( {"message" : "글 저장에 성공했습니다."} )
    } else {
      return res.status(404).json( {"message" : "글 저장에 실패하였습니다."} )
    }
  } catch(err) {
    console.error(err)
    return res.status(500).json( { "message": "글 저장에 실패하였습니다." } );
  }
})

// 글 단독 불러오기
router.get('/:diary_id', async (req, res) => {
  try {
    const diaries = await Diary.findOne({
      where: {
        id : req.params.diary_id  
      }
    })
    return res.status(200).json( diaries.dataValues )
  } catch(err) {
    console.error(err)
    return res.status(500).json( { "message": "글 단독 불러오기에 실패하였습니다." } );
  }
})

// 글 단독 날짜로 불러오기
router.get('/date/detail', async (req, res) => {
  try {
    const dateParam = req.query.date; // 쿼리 파라미터로부터 날짜 값을 가져옴
    const diary = await Diary.findOne({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('createdAt')),
        '=',
        sequelize.fn('DATE', dateParam)
      )
    });
    if(diary) {
      return res.status(200).json( diary.dataValues )
    } else {
      res.status(404).json( { "message": "존재하지 않는 글입니다." } );
    }

  } catch(err) {
    console.error(err)
    return res.status(500).json( { "message": "글 단독 불러오기에 실패하였습니다." } );
  }
})

// 글 list 불러오기
router.get('/list/:userId', async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: {
        userId : req.params.userId
      }
    })

    let values = [];
    for(let x of diaries) {
      values.push(x.dataValues)
    }

    return res.status(200).json( values )
  } catch(err) {
    console.error(err)
    return res.status(500).json( { "message": "글 list 불러오기에 실패하였습니다." } );
  }
})

// 글 수정하기
router.patch('/:diary_id', async (req, res) => {
  const { answer } = req.body
  const id = req.params.diary_id

  try {
    const diary = await Diary.update({
      answer : answer
    }, {
      where : { id : id }
    }
    )

    const editedDiary = await Diary.findOne({
      where : { id : id }
    }
    )

    console.log("***", editedDiary)

    // diary가 업데이트가 안됐을 경우
    if(diary) {
      res.status(201).json({ "answer" : editedDiary.dataValues.answer })
    } else {
      return res.status(404).json( { "message": "글 수정하기에 실패하였습니다." } )
    }
  }
  
  // 서버에 문제 생겼을때
  catch(err) {
    console.error(err)
    return res.status(500).json( { "message": "글 수정하기에 실패하였습니다." } );
  }
})


module.exports = router;