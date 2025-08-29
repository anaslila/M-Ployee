// script.js - M-Ployee Employee Management Platform

// Global Variables
let employees = [];
let reimbursements = [];
let notices = [];
let companySettings = {};
let currentEmployee = null;
let deferredPrompt;
let currentEmployeeId = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadData();
    renderEmployees();
    setupEventListeners();
    checkForPWAInstall();
});

// Initialize application
function initializeApp() {
    // Set current month for salary slip
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    document.getElementById('salaryMonth').value = currentMonth;
    
    // Load company settings
    loadCompanySettings();
    
    // Populate employee dropdowns
    populateEmployeeDropdowns();
}

// Load data from localStorage
function loadData() {
    const savedEmployees = localStorage.getItem('mployee_employees');
    const savedReimbursements = localStorage.getItem('mployee_reimbursements');
    const savedNotices = localStorage.getItem('mployee_notices');
    const savedSettings = localStorage.getItem('mployee_settings');
    
    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
        currentEmployeeId = Math.max(...employees.map(emp => parseInt(emp.id.replace('EMP', ''))), 0) + 1;
    }
    if (savedReimbursements) {
        reimbursements = JSON.parse(savedReimbursements);
    }
    if (savedNotices) {
        notices = JSON.parse(savedNotices);
    }
    if (savedSettings) {
        companySettings = JSON.parse(savedSettings);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('mployee_employees', JSON.stringify(employees));
    localStorage.setItem('mployee_reimbursements', JSON.stringify(reimbursements));
    localStorage.setItem('mployee_notices', JSON.stringify(notices));
    localStorage.setItem('mployee_settings', JSON.stringify(companySettings));
}

// Setup event listeners
function setupEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Handle form submissions
    document.addEventListener('submit', function(event) {
        event.preventDefault();
    });
}

// Tab Management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load tab-specific data
    switch(tabName) {
        case 'employees':
            renderEmployees();
            break;
        case 'payroll':
            populatePayrollEmployees();
            break;
        case 'salary-slip':
            populateSalarySlipEmployees();
            break;
        case 'reimbursement':
            renderReimbursements();
            break;
        case 'notices':
            renderNotices();
            break;
    }
}

// Employee Management Functions
function renderEmployees() {
    const grid = document.getElementById('employeesGrid');
    if (!grid) return;
    
    if (employees.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No employees found</h3>
                <p>Click "Add Employee" to get started</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = employees.map(employee => `
        <div class="employee-card" onclick="showEmployeeDetails('${employee.id}')">
            <div class="employee-card-header">
                <div class="employee-avatar">
                    ${employee.photo ? 
                        `<img src="${employee.photo}" alt="${employee.name}">` : 
                        employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                    }
                </div>
                <div class="employee-info">
                    <h3>${employee.name}</h3>
                    <p>${employee.designation || 'Not specified'}</p>
                </div>
            </div>
            <div class="employee-card-body">
                <div class="employee-detail">
                    <span class="employee-detail-label">Employee ID</span>
                    <span class="employee-detail-value">${employee.id}</span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Status</span>
                    <span class="employee-detail-value">
                        <span class="status-badge status-${employee.status.toLowerCase().replace(' ', '-')}">${employee.status}</span>
                    </span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Monthly Salary</span>
                    <span class="employee-detail-value">₹${employee.monthlySalary ? Number(employee.monthlySalary).toLocaleString() : '0'}</span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Contact</span>
                    <span class="employee-detail-value">${employee.contactNumber || 'Not provided'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showAddEmployeeModal() {
    currentEmployee = null;
    document.getElementById('modalTitle').textContent = 'Add New Employee';
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Generate new employee ID
    const newId = `EMP${String(currentEmployeeId).padStart(3, '0')}`;
    
    // Clear form
    clearEmployeeForm();
    document.getElementById('employeeId').value = newId;
    
    // Show modal
    showModal('employeeModal');
    showDetailSection('basic');
}

function showEmployeeDetails(employeeId) {
    currentEmployee = employees.find(emp => emp.id === employeeId);
    if (!currentEmployee) return;
    
    document.getElementById('modalTitle').textContent = 'Employee Details';
    document.getElementById('deleteBtn').style.display = 'inline-flex';
    
    // Populate form with employee data
    populateEmployeeForm(currentEmployee);
    
    // Show modal
    showModal('employeeModal');
    showDetailSection('basic');
}

function populateEmployeeForm(employee) {
    document.getElementById('employeeId').value = employee.id || '';
    document.getElementById('employeeName').value = employee.name || '';
    document.getElementById('contactNumber').value = employee.contactNumber || '';
    document.getElementById('emailAddress').value = employee.email || '';
    document.getElementById('address').value = employee.address || '';
    document.getElementById('designation').value = employee.designation || '';
    document.getElementById('dateOfJoining').value = employee.dateOfJoining || '';
    document.getElementById('dateOfBirth').value = employee.dateOfBirth || '';
    document.getElementById('aadharNumber').value = employee.aadharNumber || '';
    document.getElementById('panNumber').value = employee.panNumber || '';
    document.getElementById('epfNumber').value = employee.epfNumber || '';
    document.getElementById('employeeStatus').value = employee.status || 'Active';
    document.getElementById('monthlySalaryDetail').value = employee.monthlySalary || '';
    document.getElementById('annualSalary').value = employee.annualSalary || '';
    document.getElementById('performanceLastMonth').value = employee.performanceLastMonth || 'Good';
    document.getElementById('performanceLastQuarter').value = employee.performanceLastQuarter || 'Good';
    document.getElementById('performanceLastYear').value = employee.performanceLastYear || 'Good';
    document.getElementById('performanceOverall').value = employee.performanceOverall || 'Good';
    
    // Set photo
    const photoElement = document.getElementById('employeePhoto');
    if (employee.photo) {
        photoElement.src = employee.photo;
        photoElement.style.display = 'block';
    } else {
        photoElement.style.display = 'none';
    }
}

function clearEmployeeForm() {
    const form = document.querySelector('.employee-modal');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type !== 'file') {
            input.value = '';
        }
    });
    
    // Reset photo
    const photoElement = document.getElementById('employeePhoto');
    photoElement.src = '';
    photoElement.style.display = 'none';
    
    // Reset performance to default
    document.getElementById('performanceLastMonth').value = 'Good';
    document.getElementById('performanceLastQuarter').value = 'Good';
    document.getElementById('performanceLastYear').value = 'Good';
    document.getElementById('performanceOverall').value = 'Good';
}

function saveEmployee() {
    const employeeData = {
        id: document.getElementById('employeeId').value,
        name: document.getElementById('employeeName').value,
        contactNumber: document.getElementById('contactNumber').value,
        email: document.getElementById('emailAddress').value,
        address: document.getElementById('address').value,
        designation: document.getElementById('designation').value,
        dateOfJoining: document.getElementById('dateOfJoining').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        aadharNumber: document.getElementById('aadharNumber').value,
        panNumber: document.getElementById('panNumber').value,
        epfNumber: document.getElementById('epfNumber').value,
        status: document.getElementById('employeeStatus').value,
        monthlySalary: parseFloat(document.getElementById('monthlySalaryDetail').value) || 0,
        annualSalary: parseFloat(document.getElementById('annualSalary').value) || 0,
        performanceLastMonth: document.getElementById('performanceLastMonth').value,
        performanceLastQuarter: document.getElementById('performanceLastQuarter').value,
        performanceLastYear: document.getElementById('performanceLastYear').value,
        performanceOverall: document.getElementById('performanceOverall').value,
        photo: document.getElementById('employeePhoto').src || null
    };
    
    // Validation
    if (!employeeData.name || !employeeData.id) {
        alert('Please fill in all required fields (Name and Employee ID)');
        return;
    }
    
    if (currentEmployee) {
        // Update existing employee
        const index = employees.findIndex(emp => emp.id === currentEmployee.id);
        employees[index] = employeeData;
    } else {
        // Add new employee
        employees.push(employeeData);
        currentEmployeeId++;
    }
    
    saveData();
    renderEmployees();
    populateEmployeeDropdowns();
    closeModal('employeeModal');
    
    showNotification('Employee saved successfully!', 'success');
}

function deleteEmployee() {
    if (!currentEmployee) return;
    
    if (confirm(`Are you sure you want to delete ${currentEmployee.name}?`)) {
        employees = employees.filter(emp => emp.id !== currentEmployee.id);
        saveData();
        renderEmployees();
        populateEmployeeDropdowns();
        closeModal('employeeModal');
        
        showNotification('Employee deleted successfully!', 'success');
    }
}

function calculateAnnualSalary() {
    const monthlySalary = parseFloat(document.getElementById('monthlySalaryDetail').value) || 0;
    const annualSalary = monthlySalary * 12;
    document.getElementById('annualSalary').value = annualSalary;
}

// Search and Filter Functions
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm) ||
                            employee.id.toLowerCase().includes(searchTerm) ||
                            employee.designation.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || employee.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredEmployees(filteredEmployees);
}

function filterEmployees() {
    searchEmployees(); // Reuse search function
}

function renderFilteredEmployees(filteredEmployees) {
    const grid = document.getElementById('employeesGrid');
    
    if (filteredEmployees.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No employees found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredEmployees.map(employee => `
        <div class="employee-card" onclick="showEmployeeDetails('${employee.id}')">
            <div class="employee-card-header">
                <div class="employee-avatar">
                    ${employee.photo ? 
                        `<img src="${employee.photo}" alt="${employee.name}">` : 
                        employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                    }
                </div>
                <div class="employee-info">
                    <h3>${employee.name}</h3>
                    <p>${employee.designation || 'Not specified'}</p>
                </div>
            </div>
            <div class="employee-card-body">
                <div class="employee-detail">
                    <span class="employee-detail-label">Employee ID</span>
                    <span class="employee-detail-value">${employee.id}</span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Status</span>
                    <span class="employee-detail-value">
                        <span class="status-badge status-${employee.status.toLowerCase().replace(' ', '-')}">${employee.status}</span>
                    </span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Monthly Salary</span>
                    <span class="employee-detail-value">₹${employee.monthlySalary ? Number(employee.monthlySalary).toLocaleString() : '0'}</span>
                </div>
                <div class="employee-detail">
                    <span class="employee-detail-label">Contact</span>
                    <span class="employee-detail-value">${employee.contactNumber || 'Not provided'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Payroll Functions
function populatePayrollEmployees() {
    const select = document.getElementById('payrollEmployee');
    select.innerHTML = '<option value="">Choose Employee</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.name} (${employee.id})`;
        select.appendChild(option);
    });
}

function loadEmployeeSalary() {
    const employeeId = document.getElementById('payrollEmployee').value;
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (employee) {
        document.getElementById('monthlySalary').value = employee.monthlySalary || '';
    } else {
        document.getElementById('monthlySalary').value = '';
    }
}

function calculateSalary() {
    const monthlySalary = parseFloat(document.getElementById('monthlySalary').value) || 0;
    const daysWorked = parseInt(document.getElementById('daysWorked').value) || 0;
    const totalDays = parseInt(document.getElementById('totalDays').value) || 30;
    
    if (monthlySalary === 0 || daysWorked === 0) {
        alert('Please fill in all required fields');
        return;
    }
    
    const dailyRate = monthlySalary / totalDays;
    const calculatedSalary = dailyRate * daysWorked;
    const deduction = monthlySalary - calculatedSalary;
    
    const resultDiv = document.getElementById('calculationResult');
    resultDiv.innerHTML = `
        <h4>Salary Calculation Result</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div><strong>Monthly Salary:</strong> ₹${monthlySalary.toLocaleString()}</div>
            <div><strong>Daily Rate:</strong> ₹${dailyRate.toFixed(2)}</div>
            <div><strong>Days Worked:</strong> ${daysWorked} out of ${totalDays}</div>
            <div><strong>Calculated Salary:</strong> ₹${calculatedSalary.toFixed(2)}</div>
            <div><strong>Deduction:</strong> ₹${deduction.toFixed(2)}</div>
            <div><strong>Final Amount:</strong> ₹${calculatedSalary.toFixed(2)}</div>
        </div>
    `;
}

// Salary Slip Functions
function populateSalarySlipEmployees() {
    const select = document.getElementById('salarySlipEmployee');
    select.innerHTML = '<option value="">Choose Employee</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.name} (${employee.id})`;
        select.appendChild(option);
    });
}

function generateSalarySlip() {
    const employeeId = document.getElementById('salarySlipEmployee').value;
    const month = document.getElementById('salaryMonth').value;
    
    if (!employeeId || !month) {
        alert('Please select an employee and month');
        return;
    }
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Calculate salary components
    const basicSalary = employee.monthlySalary || 0;
    const hra = basicSalary * 0.4; // 40% HRA
    const da = basicSalary * 0.1; // 10% DA
    const grossSalary = basicSalary + hra + da;
    const pf = basicSalary * 0.12; // 12% PF
    const tax = grossSalary * 0.1; // 10% tax (simplified)
    const totalDeductions = pf + tax;
    const netSalary = grossSalary - totalDeductions;
    
    const salarySlipHTML = `
        <div class="salary-slip">
            <div class="slip-header">
                ${companySettings.logo ? `<img src="${companySettings.logo}" alt="Company Logo" style="height: 50px; margin-bottom: 10px;">` : ''}
                <h2>${companySettings.companyName || 'Company Name'}</h2>
                <p>${companySettings.companyAddress || 'Company Address'}</p>
                <h3>Salary Slip - ${monthName}</h3>
            </div>
            
            <div class="employee-info-slip">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div>
                        <p><strong>Employee ID:</strong> ${employee.id}</p>
                        <p><strong>Employee Name:</strong> ${employee.name}</p>
                        <p><strong>Designation:</strong> ${employee.designation || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Date of Joining:</strong> ${employee.dateOfJoining || 'N/A'}</p>
                        <p><strong>PAN Number:</strong> ${employee.panNumber || 'N/A'}</p>
                        <p><strong>EPF Number:</strong> ${employee.epfNumber || 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Earnings</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Deductions</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Basic Salary</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${basicSalary.toFixed(2)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Provident Fund</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${pf.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">HRA (40%)</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${hra.toFixed(2)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Tax Deduction</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">DA (10%)</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${da.toFixed(2)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;"></td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"></td>
                    </tr>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <td style="border: 1px solid #ddd; padding: 8px;">Gross Salary</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${grossSalary.toFixed(2)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Total Deductions</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${totalDeductions.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
                <h3 style="margin: 0; color: #1976d2;">Net Salary: ₹${netSalary.toFixed(2)}</h3>
            </div>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div>
                    <p>Employee Signature</p>
                    <div style="border-top: 1px solid #000; width: 200px; margin-top: 30px;"></div>
                </div>
                <div>
                    <p>HR Signature</p>
                    <div style="border-top: 1px solid #000; width: 200px; margin-top: 30px;"></div>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                <p>Generated on ${new Date().toLocaleDateString()}</p>
                <p>This is a computer-generated salary slip and does not require a signature.</p>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-primary" onclick="printSalarySlip()">
                <i class="fas fa-print"></i> Print Salary Slip
            </button>
            <button class="btn-secondary" onclick="downloadSalarySlipPDF('${employee.name}', '${monthName}')">
                <i class="fas fa-download"></i> Download PDF
            </button>
        </div>
    `;
    
    document.getElementById('salarySlipPreview').innerHTML = salarySlipHTML;
}

function printSalarySlip() {
    const printContent = document.querySelector('.salary-slip').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <html>
            <head>
                <title>Salary Slip</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .slip-header { text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #f8f9fa; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}

// Reimbursement Functions
function showAddReimbursementModal() {
    const modal = createReimbursementModal();
    document.body.appendChild(modal);
    showModal('reimbursementModal');
}

function createReimbursementModal() {
    const modal = document.createElement('div');
    modal.id = 'reimbursementModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Reimbursement</h2>
                <span class="close" onclick="closeModal('reimbursementModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Employee:</label>
                        <select id="reimbursementEmployee">
                            <option value="">Select Employee</option>
                            ${employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount:</label>
                        <input type="number" id="reimbursementAmount" placeholder="Enter amount">
                    </div>
                    <div class="form-group full-width">
                        <label>Description:</label>
                        <textarea id="reimbursementDescription" rows="3" placeholder="Enter description"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="reimbursementDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Status:</label>
                        <select id="reimbursementStatus">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal('reimbursementModal')">Cancel</button>
                <button class="btn-primary" onclick="saveReimbursement()">Save</button>
            </div>
        </div>
    `;
    return modal;
}

function saveReimbursement() {
    const reimbursement = {
        id: Date.now().toString(),
        employeeId: document.getElementById('reimbursementEmployee').value,
        amount: parseFloat(document.getElementById('reimbursementAmount').value),
        description: document.getElementById('reimbursementDescription').value,
        date: document.getElementById('reimbursementDate').value,
        status: document.getElementById('reimbursementStatus').value
    };
    
    if (!reimbursement.employeeId || !reimbursement.amount || !reimbursement.description) {
        alert('Please fill in all required fields');
        return;
    }
    
    reimbursements.push(reimbursement);
    saveData();
    renderReimbursements();
    closeModal('reimbursementModal');
    
    showNotification('Reimbursement added successfully!', 'success');
}

function renderReimbursements() {
    const container = document.getElementById('reimbursementList');
    if (!container) return;
    
    if (reimbursements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No reimbursements found</h3>
                <p>Click "Add Reimbursement" to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reimbursements.map(reimbursement => {
        const employee = employees.find(emp => emp.id === reimbursement.employeeId);
        return `
            <div class="list-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${employee ? employee.name : 'Unknown Employee'}</h4>
                        <p style="color: var(--text-secondary);">${reimbursement.description}</p>
                        <p style="color: var(--text-secondary); font-size: 14px;">Date: ${new Date(reimbursement.date).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 18px; font-weight: bold; color: var(--primary-color);">₹${reimbursement.amount.toLocaleString()}</p>
                        <span class="status-badge status-${reimbursement.status.toLowerCase()}">${reimbursement.status}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Notices Functions
function showAddNoticeModal() {
    const modal = createNoticeModal();
    document.body.appendChild(modal);
    showModal('noticeModal');
}

function createNoticeModal() {
    const modal = document.createElement('div');
    modal.id = 'noticeModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Notice</h2>
                <span class="close" onclick="closeModal('noticeModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label>Title:</label>
                        <input type="text" id="noticeTitle" placeholder="Enter notice title">
                    </div>
                    <div class="form-group full-width">
                        <label>Content:</label>
                        <textarea id="noticeContent" rows="5" placeholder="Enter notice content"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Priority:</label>
                        <select id="noticePriority">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="noticeDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal('noticeModal')">Cancel</button>
                <button class="btn-primary" onclick="saveNotice()">Save</button>
            </div>
        </div>
    `;
    return modal;
}

function saveNotice() {
    const notice = {
        id: Date.now().toString(),
        title: document.getElementById('noticeTitle').value,
        content: document.getElementById('noticeContent').value,
        priority: document.getElementById('noticePriority').value,
        date: document.getElementById('noticeDate').value,
        createdAt: new Date().toISOString()
    };
    
    if (!notice.title || !notice.content) {
        alert('Please fill in all required fields');
        return;
    }
    
    notices.push(notice);
    saveData();
    renderNotices();
    closeModal('noticeModal');
    
    showNotification('Notice added successfully!', 'success');
}

function renderNotices() {
    const container = document.getElementById('noticesList');
    if (!container) return;
    
    if (notices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No notices found</h3>
                <p>Click "Add Notice" to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notices.map(notice => `
        <div class="list-item">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4>${notice.title}</h4>
                    <p style="color: var(--text-secondary); margin: 8px 0;">${notice.content}</p>
                    <p style="color: var(--text-secondary); font-size: 14px;">Date: ${new Date(notice.date).toLocaleDateString()}</p>
                </div>
                <div style="text-align: right;">
                    <span class="status-badge status-${notice.priority.toLowerCase()}">${notice.priority}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Import/Export Functions
function importEmployees() {
    document.getElementById('importFileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            importEmployeeData(jsonData);
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function importEmployeeData(data) {
    let importedCount = 0;
    
    data.forEach(row => {
        if (row.Name && row.Name.trim()) {
            const employee = {
                id: row['Employee ID'] || `EMP${String(currentEmployeeId).padStart(3, '0')}`,
                name: row.Name,
                contactNumber: row['Contact Number'] || '',
                email: row['Email Address'] || '',
                address: row.Address || '',
                designation: row.Designation || '',
                dateOfJoining: row['Date of Joining'] || '',
                dateOfBirth: row['Date of Birth'] || '',
                aadharNumber: row['Aadhar Number'] || '',
                panNumber: row['PAN Number'] || '',
                epfNumber: row['EPF Number'] || '',
                status: row['Employee Status'] || 'Active',
                monthlySalary: parseFloat(row['Monthly Salary']) || 0,
                annualSalary: parseFloat(row['Annual Salary']) || 0,
                performanceLastMonth: row['Performance Last Month'] || 'Good',
                performanceLastQuarter: row['Performance Last Quarter'] || 'Good',
                performanceLastYear: row['Performance Last Year'] || 'Good',
                performanceOverall: row['Performance Overall'] || 'Good',
                photo: null
            };
            
            // Check if employee already exists
            const existingIndex = employees.findIndex(emp => emp.id === employee.id);
            if (existingIndex !== -1) {
                employees[existingIndex] = employee;
            } else {
                employees.push(employee);
                currentEmployeeId++;
            }
            importedCount++;
        }
    });
    
    saveData();
    renderEmployees();
    populateEmployeeDropdowns();
    
    showNotification(`Successfully imported ${importedCount} employees!`, 'success');
}

function exportEmployees(format) {
    if (employees.length === 0) {
        alert('No employees to export');
        return;
    }
    
    if (format === 'excel') {
        exportToExcel();
    } else if (format === 'pdf') {
        exportToPDF();
    }
}

function exportToExcel() {
    const exportData = employees.map(emp => ({
        'Employee ID': emp.id,
        'Name': emp.name,
        'Contact Number': emp.contactNumber,
        'Email Address': emp.email,
        'Address': emp.address,
        'Designation': emp.designation,
        'Date of Joining': emp.dateOfJoining,
        'Date of Birth': emp.dateOfBirth,
        'Aadhar Number': emp.aadharNumber,
        'PAN Number': emp.panNumber,
        'EPF Number': emp.epfNumber,
        'Employee Status': emp.status,
        'Monthly Salary': emp.monthlySalary,
        'Annual Salary': emp.annualSalary,
        'Performance Last Month': emp.performanceLastMonth,
        'Performance Last Quarter': emp.performanceLastQuarter,
        'Performance Last Year': emp.performanceLastYear,
        'Performance Overall': emp.performanceOverall
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    const fileName = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    showNotification('Employee data exported successfully!', 'success');
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add company header
    if (companySettings.companyName) {
        doc.setFontSize(18);
        doc.text(companySettings.companyName, 20, 20);
    }
    
    doc.setFontSize(14);
    doc.text('Employee List', 20, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    
    let yPosition = 60;
    
    employees.forEach((employee, index) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${employee.name} (${employee.id})`, 20, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.text(`   Designation: ${employee.designation || 'N/A'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Contact: ${employee.contactNumber || 'N/A'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Email: ${employee.email || 'N/A'}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Status: ${employee.status}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Monthly Salary: ₹${employee.monthlySalary ? employee.monthlySalary.toLocaleString() : '0'}`, 20, yPosition);
        yPosition += 10;
    });
    
    const fileName = `employees_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showNotification('Employee data exported as PDF successfully!', 'success');
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // Remove dynamically created modals
        if (modalId === 'reimbursementModal' || modalId === 'noticeModal') {
            modal.remove();
        }
    }
}

// Detail Section Management
function showDetailSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.detail-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.detail-nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Photo Upload Handler
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('employeePhoto').src = e.target.result;
            document.getElementById('employeePhoto').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Settings Functions
function showSettings() {
    loadCompanySettings();
    showModal('settingsModal');
}

function loadCompanySettings() {
    document.getElementById('companyName').value = companySettings.companyName || '';
    document.getElementById('employerName').value = companySettings.employerName || '';
    document.getElementById('companyContact').value = companySettings.companyContact || '';
    document.getElementById('companyAddress').value = companySettings.companyAddress || '';
    
    const logoPreview = document.getElementById('logoPreview');
    if (companySettings.logo) {
        logoPreview.innerHTML = `<img src="${companySettings.logo}" alt="Company Logo" style="max-width: 100px; max-height: 100px; margin-top: 10px;">`;
    } else {
        logoPreview.innerHTML = '';
    }
}

function handleCompanyLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Company Logo" style="max-width: 100px; max-height: 100px; margin-top: 10px;">`;
            companySettings.logo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveSettings() {
    companySettings = {
        companyName: document.getElementById('companyName').value,
        employerName: document.getElementById('employerName').value,
        companyContact: document.getElementById('companyContact').value,
        companyAddress: document.getElementById('companyAddress').value,
        logo: companySettings.logo || null
    };
    
    localStorage.setItem('mployee_settings', JSON.stringify(companySettings));
    closeModal('settingsModal');
    
    showNotification('Settings saved successfully!', 'success');
}

// About Modal
function showAbout() {
    showModal('aboutModal');
}

// Utility Functions
function populateEmployeeDropdowns() {
    populatePayrollEmployees();
    populateSalarySlipEmployees();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// PWA Functions
function checkForPWAInstall() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
    }
    
    // Show install banner after 30 seconds
    setTimeout(() => {
        const banner = document.getElementById('installBanner');
        if (banner && !localStorage.getItem('pwa-dismissed')) {
            banner.style.display = 'block';
        }
    }, 30000);
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const banner = document.getElementById('installBanner');
    if (banner && !localStorage.getItem('pwa-dismissed')) {
        banner.style.display = 'block';
    }
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            dismissInstallBanner();
        });
    }
}

function dismissInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (banner) {
        banner.style.display = 'none';
        localStorage.setItem('pwa-dismissed', 'true');
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-state {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
        grid-column: 1 / -1;
    }
    
    .empty-state h3 {
        margin-bottom: 8px;
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

// Download salary slip as PDF
function downloadSalarySlipPDF(employeeName, monthName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get the salary slip content
    const slipContent = document.querySelector('.salary-slip');
    
    // Add company header
    if (companySettings.companyName) {
        doc.setFontSize(18);
        doc.text(companySettings.companyName, 105, 20, { align: 'center' });
    }
    
    if (companySettings.companyAddress) {
        doc.setFontSize(10);
        doc.text(companySettings.companyAddress, 105, 30, { align: 'center' });
    }
    
    doc.setFontSize(16);
    doc.text(`Salary Slip - ${monthName}`, 105, 45, { align: 'center' });
    
    // Add employee details
    const employee = employees.find(emp => emp.name === employeeName);
    if (employee) {
        doc.setFontSize(10);
        doc.text(`Employee ID: ${employee.id}`, 20, 60);
        doc.text(`Employee Name: ${employee.name}`, 20, 70);
        doc.text(`Designation: ${employee.designation || 'N/A'}`, 20, 80);
        doc.text(`Date of Joining: ${employee.dateOfJoining || 'N/A'}`, 120, 60);
        doc.text(`PAN Number: ${employee.panNumber || 'N/A'}`, 120, 70);
        doc.text(`EPF Number: ${employee.epfNumber || 'N/A'}`, 120, 80);
    }
    
    const fileName = `salary-slip-${employeeName.replace(/\s+/g, '-')}-${monthName.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
}
