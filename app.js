import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://chqjgdlabjfkdfdbnrmn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocWpnZGxhYmpma2RmZGJucm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjYwNTcsImV4cCI6MjA0MzkwMjA1N30.6n59_WRHktcp2nkhQQQYwWrpCMgYhk-OzrnF89mNQtI'
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const app = document.getElementById('app');
const authContainer = document.getElementById('auth-container');
const pollListContainer = document.getElementById('poll-list-container');
const createPollContainer = document.getElementById('create-poll-container');
const pollContainer = document.getElementById('poll-container');
const pollList = document.getElementById('poll-list');
const pollOptions = document.getElementById('poll-options');

// Startup animation
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            app.style.display = 'block';
            setTimeout(() => {
                app.style.opacity = '1';
                app.style.transform = 'translateY(0)';
            }, 50);
        }, 500);
    }, 1500);
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('signup-btn').addEventListener('click', signup);
    document.getElementById('create-poll-btn').addEventListener('click', showCreatePollForm);
    document.getElementById('add-option-btn').addEventListener('click', addOptionInput);
    document.getElementById('submit-poll-btn').addEventListener('click', createPoll);
    document.getElementById('view-polls-btn').addEventListener('click', showPollList);
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.rpc('authenticate_user', {
        p_username: username,
        p_password: password
    });
    if (error) alert(error.message);
    else if (data) {
        currentUser = { id: data, username: username };
        showDashboard();
    } else {
        alert('Invalid username or password');
    }
}

async function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.rpc('sign_up_user', {
        p_username: username,
        p_password: password
    });
    if (error) alert(error.message);
    else if (data) {
        currentUser = { id: data, username: username };
        showDashboard();
    } else {
        alert('Failed to create user');
    }
}

function showDashboard() {
    authContainer.style.display = 'none';
    if (currentUser.username === 'apet2804@mpsedu.org') {
        document.getElementById('create-poll-btn').style.display = 'block';
    } else {
        document.getElementById('create-poll-btn').style.display = 'none';
    }
    showPollList();
}

async function showPollList() {
    pollListContainer.style.display = 'block';
    createPollContainer.style.display = 'none';
    pollContainer.style.display = 'none';
    const { data: polls, error } = await supabase.from('polls').select('*');
    if (error) alert(error.message);
    else {
        pollList.innerHTML = '';
        polls.forEach((poll, index) => {
            const li = document.createElement('li');
            li.textContent = `${poll.title} (Deadline: ${new Date(poll.deadline).toLocaleString()})`;
            li.classList.add('fade-in');
            li.style.animationDelay = `${index * 0.1}s`;
            li.addEventListener('click', () => showPoll(poll.id));
            pollList.appendChild(li);
        });
    }
}

function showCreatePollForm() {
    if (currentUser.username !== 'apet2804@mpsedu.org') {
        alert('Only apet2804@mpsedu.org can create polls');
        return;
    }
    pollListContainer.style.display = 'none';
    createPollContainer.style.display = 'block';
}

function addOptionInput() {
    const optionsContainer = document.getElementById('options-container');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'option-input';
    newInput.placeholder = `Option ${optionsContainer.children.length + 1}`;
    optionsContainer.appendChild(newInput);
}

async function createPoll() {
    if (currentUser.username !== 'apet2804@mpsedu.org') {
        alert('Only apet2804@mpsedu.org can create polls');
        return;
    }

    const title = document.getElementById('poll-title').value;
    const deadline = document.getElementById('poll-deadline').value;
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(input => input.value).filter(value => value.trim() !== '');

    const { data, error } = await supabase
        .from('polls')
        .insert({ title, user_id: currentUser.id, deadline })
        .select()
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    const optionsToInsert = options.map(option => ({
        poll_id: data.id,
        text: option,
        votes: 0
    }));

    const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

    if (optionsError) {
        alert(optionsError.message);
        return;
    }

    showPollList();
}

async function showPoll(pollId) {
    pollListContainer.style.display = 'none';
    pollContainer.style.display = 'block';

    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

    if (pollError) {
        alert(pollError.message);
        return;
    }

    const { data: options, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('poll_id', pollId);

    if (optionsError) {
        alert(optionsError.message);
        return;
    }

    document.getElementById('poll-title').textContent = poll.title;
    document.getElementById('poll-deadline').textContent = `Deadline: ${new Date(poll.deadline).toLocaleString()}`;
    pollOptions.innerHTML = '';

    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'poll-option fade-in';
        optionElement.style.animationDelay = `${index * 0.1}s`;
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        optionElement.textContent = `${option.text} (${option.votes} votes, ${percentage.toFixed(2)}%)`;
        
        const barElement = document.createElement('div');
        barElement.className = 'poll-option-bar';
        barElement.style.width = '0%';
        
        optionElement.appendChild(barElement);
        pollOptions.appendChild(optionElement);
        
        if (new Date() < new Date(poll.deadline)) {
            optionElement.addEventListener('click', () => vote(option.id, pollId));
        }
        
        setTimeout(() => {
            barElement.style.width = `${percentage}%`;
        }, 100);
    });
}

async function vote(optionId, pollId) {
    const { error } = await supabase.rpc('increment_vote', {
        option_id: optionId
    });

    if (error) {
        alert(error.message);
        return;
    }

    showPoll(pollId);
}