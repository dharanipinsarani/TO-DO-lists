const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/todo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Task schema and model
const TaskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    }
});

const Task = mongoose.model('Task', TaskSchema);

// Middleware for JSON body parsing
app.use(bodyParser.json());

// Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Task text is required' });
    }

    try {
        const newTask = new Task({ text });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT (update) a task by ID
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { text, completed }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a task by ID
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
