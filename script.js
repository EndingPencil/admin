// --- START: SUPABASE SETUP ---
const SUPABASE_URL = 'https://zwuarlfxdruwwdceirjt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dWFybGZ4ZHJ1d3dkY2Vpcmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzYwMDQsImV4cCI6MjA3MjY1MjAwNH0.OtVcgZ-mDvLpP8hSu5Go9A-ZyhOqkdoMANwvN97CpXg';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END: SUPABASE SETUP ---


const issuesList = document.getElementById('issues-list');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');

let allIssues = [];

async function fetchAndRenderIssues() {
    issuesList.innerHTML = '<p>Loading issues...</p>';
    const { data, error } = await supabaseClient
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching issues:', error);
        issuesList.innerHTML = '<p>Could not load issues.</p>';
        return;
    }
    allIssues = data;
    displayAnalytics(allIssues);
    renderIssues(allIssues); 
}

// --- ANALYTICS FUNCTION ---
function displayAnalytics(issues) {
    const total = issues.length;
    const pending = issues.filter(issue => issue.status === 'Pending').length;
    const inProgress = issues.filter(issue => issue.status === 'In Progress').length;
    const solved = issues.filter(issue => issue.status === 'Solved').length;

    document.getElementById('total-reports').textContent = total;
    document.getElementById('pending-reports').textContent = pending;
    document.getElementById('inprogress-reports').textContent = inProgress;
    document.getElementById('solved-reports').textContent = solved;
}
// --- END ANALYTICS FUNCTION ---

function renderIssues(issues) {
    issuesList.innerHTML = '';
    if (issues.length === 0) {
        issuesList.innerHTML = '<p>No issues found.</p>';
        return;
    }

    issues.forEach(issue => {
        const issueCard = document.createElement('div');
        issueCard.className = 'issue-card';
        issueCard.setAttribute('data-id', issue.id); 
        
        issueCard.innerHTML = `
            <img src="https://via.placeholder.com/400x200.png?text=Issue+Image" alt="${issue.problem_type}">
            <div class="issue-card-content">
                <h3>${issue.problem_type} on ${issue.location}</h3>
                <p><strong>Description:</strong> ${issue.description || 'No description provided.'}</p>
                <p><strong>Date:</strong> ${new Date(issue.created_at).toLocaleString()}</p>
                <span class="status ${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span>
                <div class="admin-actions">
                    <button class="action-btn in-progress-btn">Mark In Progress</button>
                    <button class="action-btn resolved-btn">Mark Resolved</button>
                </div>
            </div>
        `;
        issuesList.appendChild(issueCard);
    });
}

function filterIssues() {
    const selectedStatus = statusFilter.value;
    const filteredIssues = allIssues.filter(issue => {
        return selectedStatus === 'all' || issue.status === selectedStatus;
    });
    renderIssues(filteredIssues);
}

async function updateIssueStatus(issueId, newStatus) {
    const { error } = await supabaseClient
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

    if (error) {
        console.error('Error updating status:', error);
        alert('Could not update status.');
    } else {
        fetchAndRenderIssues(); 
    }
}

issuesList.addEventListener('click', (event) => {
    if (event.target.matches('.action-btn')) {
        const card = event.target.closest('.issue-card');
        const issueId = card.dataset.id;
        
        if (event.target.matches('.in-progress-btn')) {
            updateIssueStatus(issueId, 'In Progress');
        } else if (event.target.matches('.resolved-btn')) {
            updateIssueStatus(issueId, 'Solved');
        }
    }
});

statusFilter.addEventListener('change', filterIssues);
document.addEventListener('DOMContentLoaded', fetchAndRenderIssues);