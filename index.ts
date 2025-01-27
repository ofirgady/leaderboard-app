import pool from './db'

const testDB = async () => {
	try {
		const res = await pool.query('SELECT * FROM users')
		console.log(res.rows)
	} catch (err) {
		console.error('Error connecting to the database', err)
	}
}

testDB()
