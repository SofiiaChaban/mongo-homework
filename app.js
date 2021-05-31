'use strict'
const students = require('./students.json');
const { mapUser, getRandomFirstName } = require('./util')

// db connection and settings
const connection = require('./config/connection')
let userCollection, studentCollection
run()

async function run() {
  await connection.connect()
  //await connection.get().createCollection('users')
  //await connection.get().dropCollection('users')
  userCollection = connection.get().collection('users')

  //await connection.get().dropCollection('students')
  //await connection.get().createCollection('students')
  studentCollection = connection.get().collection('students')

  //await example1()
  //await example2()
  //await example3()
  //await example4()
  //await example5()
  //await example6()
  //await example7()
  await example8()
  //await example10()
  await connection.close()
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {

  try {
    const departments = ['a', 'a', 'b', 'b', 'c', 'c']
    const users = departments.map(d => ({ department: d })).map(mapUser)
    try {
      const { res } = await userCollection.insertMany(users)
    }
    catch (e) {
      console.log(e)
    }

  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)

async function example2() {
  try {
    const { res } = await userCollection.deleteOne({ department: 'a' })

  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    const { res } = await userCollection.updateOne({ department: 'b' }, { $set: { firstName: "NewFirstName" } })

  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const res = await userCollection.find({ department: 'c' }).toArray()
    console.log(res)
  } catch (err) {
    console.error(err)
  }
}

// Import all data from students.json into student collection

async function example5() {
  try {
    const res = await studentCollection.insertMany(students)
  }
  catch (e) {
    console.log(e);
  }
}

//Find all students who have the worst score for homework, sort by descent
async function example6() {
  try {
    const pipeline = [
      { $unwind: '$scores' },
      {
        $match: {
          'scores.type': 'homework'
        }
      },
      {
        $sort: {
          'scores.score': 1
        }
      }
    ]
    const res = studentCollection.aggregate(pipeline)
    await res.forEach(student => {
      console.log(`${student.name}`);
    });
  }
  catch (e) {
    console.log(e);
  }
}

//- Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function example7() {
  try {
    const res = studentCollection.find().sort({ 'scores.1.score': -1, 'scores.2.score': 1 })
    await res.forEach(student => {
      console.log(`${student.name}`);
    });
  }
  catch (e) {
    console.log(e);
  }
}
//- Find all students who have best scope for quiz and exam
async function example8() {
  try {
    const res = await studentCollection.aggregate([
      {
        $addFields:{
          examScores: {
            $arrayElemAt:["$scores",0]
          },
          quizScores: {
            $arrayElemAt:["$scores",1]
          }
        }
      },
      {
        $addFields:{
          totalScore: {
            $add: ["$examScores.score","$quizScores.score"]
          }
        }
      },
      {
        $sort: {
          totalScore:-1
        }
      }
    ]).toArray();
    const sudentsRate = await res.forEach(student => {
      console.log(student.name);
    })
  }
  catch (e) {
    console.log(e);
  }
}
//- Calculate the average score for homework for all students

async function example9() {
  try {
    const pipeline = [
      { $unwind: '$scores' },
      {
        $match: {
          'scores.type': 'homework'
        }
      },
      {
        $group: {
          _id: null,
          average_score: {
            $avg: '$scores.score'
          }
        }
      }
    ]
    const res = await studentCollection.aggregate(pipeline)
    await res.forEach(el => { console.log(el.average_score) })
  }
  catch (e) {
    console.log(e)
  }

}
//Delete all students that have homework score <= 60
async function example10() {
  try {
    const pipeline = [
      { $unwind: '$scores' },
      {
        $match: {
          'scores.type': 'homework',
          'scores.score': { $lte: 60 }
        }
      }
    ]
    const idToRemove = await studentCollection.aggregate(pipeline).map((d) => d._id).toArray();
    await studentCollection.deleteMany({ _id: { $in: idToRemove } })
  }
  catch (e) {
    console.log(e)
  }
}
//Mark students that have quiz score => 80
async function example11() {
  try {
    const pipeline = [
      { $unwind: '$scores' },
      {
        $match: {
          'scores.type': 'quiz',
          'scores.score': { $gte: 80 }
        }
      }
    ]
    const res = await studentCollection.aggregate(pipeline).toArray()
    await studentCollection.updateMany({ _id: { $in: res } }, { $set: { marked: true } });
  }
  catch (e) {
    console.log(e)
  }
}

