import supabase from './supabase.js'

let currentUser = null;

// DOM elements
const authContainer = document.getElementById('auth-container');
const pollListContainer = document.getElementById('poll-list-container');
const createPollContainer = document.getElementById('create-poll-container');
const pollContainer = document.getElementById('poll-container');
const pollList = document.getElementById('poll-list');
const pollOptions = document.getElementById('poll-options');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('signup-btn').addEventListener('click', signup);
    document.getElementById('create-poll-btn').addEventListener('click', showCreatePollForm);
    document.getElementById('add-option-btn').addEventListener('click', addOptionInput);
    document.getElementById('submit-poll-btn').addEventListener('click', createPoll);
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
        showPollList();
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
        showPollList();
    } else {
        alert('Failed to create user');
    }
}

async function showPollList() {
    authContainer.style.display = 'none';
    pollListContainer.style.display = 'block';
    const { data: polls, error } = await supabase.rpc('get_user_polls', {
        p_user_id: currentUser.id
    });
    if (error) alert(error.message);
    else {
        pollList.innerHTML = '';
        polls.forEach(poll => {
            const li = document.createElement('li');
            li.textContent = poll.poll_title;
            li.classList.add('fade-in');
            li.addEventListener('click', () => showPoll(poll.poll_id));
            pollList.appendChild(li);
        });
    }
}

function showCreatePollForm() {
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
    if (!currentUser) {
        alert('You must be logged in to create a poll');
        return;
    }

    const title = document.getElementById('poll-title').value;
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(input => input.value).filter(value => value.trim() !== '');

    const { data, error } = await supabase.rpc('create_poll', {
        p_title: title,
        p_user_id: currentUser.id,
        p_options: options
    });

    if (error) {
        alert(error.message);
        return;
    }

    showPollList();
}

async function showPoll(pollId) {
    pollListContainer.style.display = 'none';
    pollContainer.style.display = 'block';

    const { data: results, error } = await supabase.rpc('get_poll_results', {
        p_poll_id: pollId
    });

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById('poll-title').textContent = results[0].poll_title;
    pollOptions.innerHTML = '';

    results.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'poll-option fade-in';
        optionElement.textContent = `${option.option_text} (${option.vote_count} votes, ${option.percentage}%)`;
        
        const barElement = document.createElement('div');
        barElement.className = 'poll-option-bar';
        barElement.style.width = '0%';
        
        optionElement.appendChild(barElement);
        pollOptions.appendChild(optionElement);
        
        optionElement.addEventListener('click', () => vote(option.option_id, pollId));
        
        setTimeout(() => {
            barElement.style.width = `${option.percentage}%`;
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