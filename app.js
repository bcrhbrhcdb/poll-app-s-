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
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('create-poll-btn').addEventListener('click', showCreatePollForm);
document.getElementById('add-option-btn').addEventListener('click', addOptionInput);
document.getElementById('submit-poll-btn').addEventListener('click', createPoll);

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@example.com`,
        password: password,
    });
    if (error) alert(error.message);
    else {
        currentUser = data.user;
        showPollList();
    }
}

async function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({
        email: `${username}@example.com`,
        password: password,
    });
    if (error) alert(error.message);
    else {
        await supabase.from('users').insert({ id: data.user.id, username });
        currentUser = data.user;
        showPollList();
    }
}

async function showPollList() {
    authContainer.style.display = 'none';
    pollListContainer.style.display = 'block';
    const { data: polls, error } = await supabase.from('polls').select('*');
    if (error) alert(error.message);
    else {
        pollList.innerHTML = '';
        polls.forEach(poll => {
            const li = document.createElement('li');
            li.textContent = poll.title;
            li.classList.add('fade-in');
            li.addEventListener('click', () => showPoll(poll.id));
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
    const title = document.getElementById('poll-title').value;
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(input => input.value).filter(value => value.trim() !== '');

    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({ title, user_id: currentUser.id })
        .select()
        .single();

    if (pollError) {
        alert(pollError.message);
        return;
    }

    const optionsToInsert = options.map(option => ({
        poll_id: poll.id,
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
    pollOptions.innerHTML = '';

    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'poll-option fade-in';
        optionElement.textContent = option.text;
        
        const votePercentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        
        const barElement = document.createElement('div');
        barElement.className = 'poll-option-bar';
        barElement.style.width = '0%';
        
        optionElement.appendChild(barElement);
        pollOptions.appendChild(optionElement);
        
        optionElement.addEventListener('click', () => vote(option.id, pollId));
        
        setTimeout(() => {
            barElement.style.width = `${votePercentage}%`;
        }, 100);
    });
}

async function vote(optionId, pollId) {
    const { error } = await supabase.rpc('increment_vote', {
        option_id: optionId,
    });

    if (error) {
        alert(error.message);
        return;
    }

    showPoll(pollId);
}