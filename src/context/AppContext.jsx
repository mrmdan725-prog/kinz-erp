import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Finance State - Moved to top to avoid ReferenceErrors
    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_transactions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse transactions from localStorage:", e);
            return [];
        }
    });

    const [accounts, setAccounts] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_accounts');
            let data = saved ? JSON.parse(saved) : [
                { id: '1', name: 'الخزنة الرئيسية', balance: 0 }
            ];
            return data;
        } catch (e) {
            console.error("Failed to parse accounts from localStorage:", e);
            return [
                { id: '1', name: 'الخزنة الرئيسية', balance: 0 }
            ];
        }
    });

    // HR State - Moved to top
    const [employees, setEmployees] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_employees');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse employees from localStorage:", e);
            return [];
        }
    });

    // Recurring Expenses State - Moved to top
    const [recurringExpenses, setRecurringExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_recurring');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse recurring expenses from localStorage:", e);
            return [];
        }
    });

    const [customers, setCustomers] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_customers');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse customers from localStorage:", e);
            return [];
        }
    });

    const [purchases, setPurchases] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_purchases');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse purchases from localStorage:", e);
            return [];
        }
    });

    const [inventory, setInventory] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_inventory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse inventory from localStorage:", e);
            return [];
        }
    });

    const [inventoryMovements, setInventoryMovements] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_inventory_movements');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse inventory movements from localStorage:", e);
            return [];
        }
    });


    const [inspections, setInspections] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_inspections');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse inspections from localStorage:", e);
            return [];
        }
    });

    const [invoices, setInvoices] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_invoices');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse invoices from localStorage:", e);
            return [];
        }
    });

    const [serviceItems, setServiceItems] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_service_items');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse service items:", e);
            return [];
        }
    });

    const defaultPermissions = {
        canViewDashboard: false,
        canManageUsers: false,
        canManagePurchases: false,
        canManageInventory: false,
        canManageCustomers: false,
        canManageFinance: false,
        canManageHR: false,
        canManageInvoices: false,
        canManageDeliveries: false
    };

    const adminPermissions = {
        canViewDashboard: true,
        canManageUsers: true,
        canManagePurchases: true,
        canManageInventory: true,
        canManageCustomers: true,
        canManageFinance: true,
        canManageHR: true,
        canManageInvoices: true,
        canManageInspections: true,
        canManageDeliveries: true
    };

    const [users, setUsers] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_users');
            let data = saved ? JSON.parse(saved) : [];
            const defaults = [
                { id: '1', name: 'المسؤول', role: 'admin', username: 'admin', password: '123', status: 'active', permissions: adminPermissions },
                { id: '2', name: 'محمد رمضان', role: 'admin', username: 'mhmd', password: '123', status: 'active', permissions: adminPermissions }
            ];

            // Update old users with default permissions if missing
            data = data.map(u => {
                const upToDatePermissions = u.permissions || (u.role === 'admin' ? adminPermissions : defaultPermissions);
                // Extra safety: if admin, ensure all keys are present
                if (u.role === 'admin') {
                    return { ...u, permissions: { ...adminPermissions, ...u.permissions } };
                }
                return { ...u, permissions: upToDatePermissions };
            });

            // Ensure defaults are present
            defaults.forEach(def => {
                if (!data.find(u => u.username === def.username)) {
                    data.push(def);
                }
            });

            return data;
        } catch (e) {
            console.error("Failed to parse users from localStorage:", e);
            return [
                { id: '1', name: 'المسؤول', role: 'admin', username: 'admin', password: '123', status: 'active', permissions: adminPermissions },
                { id: '2', name: 'محمد فتوح', role: 'admin', username: 'mhmd', password: '123', status: 'active', permissions: adminPermissions }
            ];
        }
    });

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_current_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse currentUser from localStorage:", e);
            return null;
        }
    });

    const [systemSettings, setSystemSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_settings');
            return saved ? JSON.parse(saved) : {
                companyName: 'كنز للأثاث والمطابخ',
                currency: 'ج.م',
                taxRate: 14,
                address: 'العاشر من رمضان، مصر',
                phone: '01012345678',
                inspectionFee: 500,
                representativeName: '',
                representativeNationalId: ''
            };
        } catch (e) {
            console.error("Failed to parse settings from localStorage:", e);
            return {
                companyName: 'كينز للأثاث والمطابخ',
                currency: 'ج.م',
                taxRate: 14,
                address: 'العاشر من رمضان، مصر',
                phone: '01012345678',
                inspectionFee: 500,
                representativeName: '',
                representativeNationalId: ''
            };
        }
    });

    const [contractOptions, setContractOptions] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_contract_options');
            return saved ? JSON.parse(saved) : {
                projectTypes: ['مطبخ', 'دريسنج', 'وحدات حمام', 'أخرى'],
                woodTypes: ['HPL', 'UV', 'قشرة طبيعي', 'أكريليك', 'بولي لاك', 'سوبر جلوس'],
                innerShellTypes: ['أبيض فايبر', 'خشبي فايبر', 'أبيض ميلامين', 'خشبي ميلامين'],
                hingeTypes: ['إغلاق هادئ (Soft Close)', 'عادي'],
                slideTypes: ['إغلاق هادئ (Soft Close)', 'عادي'],
                handleTypes: ['داخلي (G-Line)', 'خارجي متصل', 'خارجي منفصل'],
                accessoryNames: ['سلة مهملات', 'صفاية أطباق', 'منظم أدراج', 'إضاءة لد'],
                hangingTypes: ['تعليقة بليتة', 'تعليقة كوابيل'],
                flipUpTypes: ['هيدروليك باكم', 'أفنتوس بلوم', 'ميكانزم صيني'],
                legTypes: ['رجول ألمنيوم', 'رجول بلاستيك', 'رجول إستانلس'],
                toeKickTypes: ['وزر ألمنيوم', 'وزر خشب نفس اللون', 'وزر بلاستيك'],
                units: ['متر مربع', 'متر طولي', 'قطعة', 'لوح', 'لتر', 'كجم']
            };
        } catch (e) {
            console.error("Failed to parse contract options from localStorage:", e);
            return {
                projectTypes: ['مطبخ', 'دريسنج', 'وحدات حمام', 'أخرى'],
                woodTypes: ['HPL', 'UV', 'قشرة طبيعي', 'أكريليك', 'بولي لاك', 'سوبر جلوس'],
                innerShellTypes: ['أبيض فايبر', 'خشبي فايبر', 'أبيض ميلامين', 'خشبي ميلامين'],
                hingeTypes: ['إغلاق هادئ (Soft Close)', 'عادي'],
                slideTypes: ['إغلاق هادئ (Soft Close)', 'عادي'],
                handleTypes: ['داخلي (G-Line)', 'خارجي متصل', 'خارجي منفصل'],
                accessoryNames: ['سلة مهملات', 'صفاية أطباق', 'منظم أدراج', 'إضاءة لد'],
                hangingTypes: ['تعليقة بليتة', 'تعليقة كوابيل'],
                flipUpTypes: ['هيدروليك باكم', 'أفنتوس بلوم', 'ميكانزم صيني'],
                legTypes: ['رجول ألمنيوم', 'رجول بلاستيك', 'رجول إستانلس'],
                toeKickTypes: ['وزر ألمنيوم', 'وزر خشب نفس اللون', 'وزر بلاستيك'],
                units: ['متر مربع', 'متر طولي', 'قطعة', 'لوح', 'لتر', 'كجم']
            };
        }
    });


    const [darkMode, setDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('kinz_theme');
            return saved ? JSON.parse(saved) : true; // Default to dark mode
        } catch (e) {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem('kinz_theme', JSON.stringify(darkMode));
        if (darkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }, [darkMode]);

    const [isCloudLoading, setIsCloudLoading] = useState(true);

    // Migration & Real-time Sync Logic (Supabase)
    useEffect(() => {
        let activeChannels = [];

        const startSync = async () => {
            if (!supabase) {
                console.warn("Supabase client not initialized. Real-time sync disabled.");
                setIsCloudLoading(false);
                return;
            }

            // Helper for Denormalization (Postgres lowercase -> React camelCase)
            const denormalize = (data) => {
                if (!data) return data;
                const mapping = {
                    'projectcost': 'projectCost',
                    'projecttype': 'projectType',
                    'customername': 'customerName',
                    'unitprice': 'unitPrice',
                    'serialnumber': 'serialNumber',
                    'invoicefile': 'invoiceFile',
                    'materialname': 'materialName',
                    'customerid': 'customerId',
                    'lastprice': 'lastPrice',
                    'minstock': 'minStock',
                    'scheduleddate': 'scheduledDate',
                    'companyname': 'companyName',
                    'taxrate': 'taxRate',
                    'inspectionfee': 'inspectionFee',
                    'representativename': 'representativeName',
                    'representativenationalid': 'representativeNationalId',
                    'currencysymbol': 'currencySymbol',
                    'itemid': 'itemId',
                    'itemname': 'itemName'
                };

                const mapItem = (item) => {
                    const normalized = { ...item };
                    Object.keys(mapping).forEach(lower => {
                        if (item[lower] !== undefined) {
                            normalized[mapping[lower]] = item[lower];
                        }
                    });
                    return normalized;
                };

                return Array.isArray(data) ? data.map(mapItem) : mapItem(data);
            };

            const tablesToSync = [
                { name: 'customers', state: customers, setter: setCustomers },
                { name: 'purchases', state: purchases, setter: setPurchases },
                { name: 'inventory', state: inventory, setter: setInventory },
                { name: 'inventory_movements', state: inventoryMovements, setter: setInventoryMovements },
                { name: 'inspections', state: inspections, setter: setInspections },
                { name: 'invoices', state: invoices, setter: setInvoices },
                { name: 'users', state: users, setter: setUsers },
                { name: 'settings', state: systemSettings, setter: setSystemSettings, isSingle: true },
                { name: 'transactions', state: transactions, setter: setTransactions },
                { name: 'accounts', state: accounts, setter: setAccounts },
                { name: 'employees', state: employees, setter: setEmployees },
                { name: 'recurring', state: recurringExpenses, setter: setRecurringExpenses },
                { name: 'contract_options', state: contractOptions, setter: setContractOptions, isSingle: true }
            ];

            // 1. Initial Migration Check (LocalStorage to Supabase)
            try {
                for (const tableSpec of tablesToSync) {
                    try {
                        const { data: existingData, error } = await supabase.from(tableSpec.name).select('*');

                        if (error) {
                            console.error(`❌ Sync error for ${tableSpec.name}:`, error.message);
                            continue;
                        }

                        if ((!existingData || existingData.length === 0) && tableSpec.state.length > 0) {
                            console.log(`📤 Migrating ${tableSpec.name}...`);
                            // Map local fields to lowercase columns to avoid PG case issues
                            const dataToInsert = (tableSpec.isSingle ? [tableSpec.state] : tableSpec.state).map(item => {
                                const normalized = {};
                                Object.keys(item).forEach(key => {
                                    let value = item[key];
                                    // Ensure projectCost is a number if present
                                    if (key === 'projectCost' && typeof value === 'string') {
                                        value = parseFloat(value);
                                    }
                                    normalized[key.toLowerCase()] = value;
                                });
                                return normalized;
                            }).slice(0, 50);

                            const { error: insertError } = await supabase.from(tableSpec.name).insert(dataToInsert);
                            if (insertError) console.error(`❌ Migration failed for ${tableSpec.name}:`, insertError.message);
                            else console.log(`✅ ${tableSpec.name} migrated`);
                        } else if (existingData && existingData.length > 0) {
                            const normalizedData = denormalize(existingData);
                            if (tableSpec.isSingle) tableSpec.setter(normalizedData[0]);
                            else tableSpec.setter(normalizedData);
                        }
                    } catch (err) { console.error(err); }
                }
            } catch (err) {
                console.warn("⚠️ Sync loop interrupted.", err);
            } finally {
                setIsCloudLoading(false);
            }

            // 2. Set up real-time sync via Supabase Channels
            activeChannels = tablesToSync.map(tableSpec => {
                return supabase.channel(`public:${tableSpec.name}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: tableSpec.name }, (payload) => {
                        supabase.from(tableSpec.name).select('*').then(({ data }) => {
                            if (data) {
                                const normalizedData = denormalize(data);
                                if (tableSpec.isSingle) tableSpec.setter(normalizedData[0]);
                                else tableSpec.setter(normalizedData);
                            }
                        });
                    })
                    .subscribe();
            });
        };

        startSync();

        return () => {
            activeChannels.forEach(channel => channel.unsubscribe());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('kinz_customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('kinz_purchases', JSON.stringify(purchases));
    }, [purchases]);

    useEffect(() => {
        localStorage.setItem('kinz_inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('kinz_inventory_movements', JSON.stringify(inventoryMovements));
    }, [inventoryMovements]);

    useEffect(() => {
        localStorage.setItem('kinz_inspections', JSON.stringify(inspections));
    }, [inspections]);

    useEffect(() => {
        localStorage.setItem('kinz_invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('kinz_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('kinz_settings', JSON.stringify(systemSettings));
    }, [systemSettings]);

    useEffect(() => {
        localStorage.setItem('kinz_contract_options', JSON.stringify(contractOptions));
    }, [contractOptions]);

    useEffect(() => {
        if (currentUser) {
            // Find the most up-to-date version of this user from our users list
            const latestUser = users.find(u => u.id === currentUser.id || u.username === currentUser.username);
            if (latestUser && JSON.stringify(latestUser.permissions) !== JSON.stringify(currentUser.permissions)) {
                setCurrentUser(latestUser);
            }
            localStorage.setItem('kinz_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('kitchinz_current_user');
        }
    }, [currentUser, users]);

    useEffect(() => {
        localStorage.setItem('kinz_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('kinz_accounts', JSON.stringify(accounts));
    }, [accounts]);
    const addTransaction = async (transaction) => {
        const id = Date.now().toString();
        const newTransaction = {
            ...transaction,
            id,
            date: transaction.date || new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        try {
            if (supabase) await supabase.from('transactions').insert(newTransaction);
        } catch (e) { console.error(e); }

        // Update Physical Account Balance
        setAccounts(prevAccounts => {
            const nextAccounts = prevAccounts.map(acc => {
                if (acc.name === transaction.account) {
                    const newBalance = transaction.type === 'income'
                        ? acc.balance + parseFloat(transaction.amount)
                        : acc.balance - parseFloat(transaction.amount);

                    // DB internal update (not calling function to avoid nested setAccounts)
                    if (supabase) supabase.from('accounts').update({ balance: newBalance }).eq('id', acc.id).then();

                    return { ...acc, balance: newBalance };
                }
                return acc;
            });
            return nextAccounts;
        });

        // Update Customer Balance if customerName is provided OR if account is a customer name
        const targetCustomer = transaction.customerName || transaction.account;
        setCustomers(prevCustomers => {
            const nextCustomers = prevCustomers.map(cust => {
                if (cust.name === targetCustomer) {
                    const newBalance = (cust.balance || 0) + (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));

                    // DB internal update
                    if (supabase) supabase.from('customers').update({ balance: newBalance }).eq('id', cust.id).then();

                    return { ...cust, balance: newBalance };
                }
                return cust;
            });
            return nextCustomers;
        });
    };

    const deleteTransaction = async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            // Reverse balance impact
            setAccounts(prevAccounts => prevAccounts.map(acc => {
                if (acc.name === transaction.account) {
                    const newBalance = transaction.type === 'income'
                        ? acc.balance - parseFloat(transaction.amount) // subtract if it was income
                        : acc.balance + parseFloat(transaction.amount); // add back if it was expense
                    updateAccount({ ...acc, balance: newBalance }); // Handles Firestore
                    return { ...acc, balance: newBalance };
                }
                return acc;
            }));

            // Reverse Customer Balance (Profit Logic Reversal)
            // Reverse Customer Balance (Profit Logic Reversal)
            const targetCustomer = transaction.customerName || transaction.account;
            setCustomers(prevCustomers => prevCustomers.map(cust => {
                if (cust.name === targetCustomer) {
                    // Reverse: Income was (+), so now (-); Expense was (-), so now (+)
                    const newBalance = (cust.balance || 0) - (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
                    updateCustomer({ ...cust, balance: newBalance }); // Handles Firestore
                    return { ...cust, balance: newBalance };
                }
                return cust;
            }));

            try {
                if (supabase) await supabase.from('transactions').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const updateTransaction = async (updatedTransaction) => {
        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTransaction) return;

        setAccounts(prevAccounts => prevAccounts.map(acc => {
            let newBalance = acc.balance;

            // 1. Reverse old impact
            if (acc.name === oldTransaction.account) {
                newBalance = oldTransaction.type === 'income'
                    ? newBalance - parseFloat(oldTransaction.amount)
                    : newBalance + parseFloat(oldTransaction.amount);
            }

            // 2. Apply new impact
            if (acc.name === updatedTransaction.account) {
                newBalance = updatedTransaction.type === 'income'
                    ? newBalance + parseFloat(updatedTransaction.amount)
                    : newBalance - parseFloat(updatedTransaction.amount);
            }

            if (newBalance !== acc.balance) {
                updateAccount({ ...acc, balance: newBalance }); // Handles Firestore
            }
            return { ...acc, balance: newBalance };
        }));

        // Handle Customer Balance Updates (Profit Logic)
        const oldTargetCustomer = oldTransaction.customerName || oldTransaction.account;
        const newTargetCustomer = updatedTransaction.customerName || updatedTransaction.account;

        setCustomers(prevCustomers => prevCustomers.map(cust => {
            let newBalance = cust.balance || 0;

            // 1. Reverse old impact
            if (cust.name === oldTargetCustomer) {
                newBalance = oldTransaction.type === 'income'
                    ? newBalance - parseFloat(oldTransaction.amount) // Remove previously added income
                    : newBalance + parseFloat(oldTransaction.amount); // Add back previously subtracted expense
            }

            // 2. Apply new impact
            if (cust.name === newTargetCustomer) {
                newBalance = updatedTransaction.type === 'income'
                    ? newBalance + parseFloat(updatedTransaction.amount) // Add new income
                    : newBalance - parseFloat(updatedTransaction.amount); // Subtract new expense
            }

            if (newBalance !== (cust.balance || 0)) {
                updateCustomer({ ...cust, balance: newBalance }); // Handles Firestore
            }
            return { ...cust, balance: newBalance };
        }));

        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        try {
            if (supabase) await supabase.from('transactions').update(updatedTransaction).eq('id', updatedTransaction.id);
        } catch (e) { console.error(e); }
    };

    const addAccount = async (account) => {
        const id = Date.now().toString();
        const newAcc = { ...account, id, balance: Number(account.balance) || 0 };
        setAccounts([...accounts, newAcc]);
        try {
            if (supabase) await supabase.from('accounts').insert(newAcc);
        } catch (e) { console.error(e); }
    };

    const updateAccount = async (updatedAccount) => {
        setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
        try {
            if (supabase) await supabase.from('accounts').update(updatedAccount).eq('id', updatedAccount.id);
        } catch (e) { console.error(e); }
    };

    const recalculateAccountBalances = () => {
        setAccounts(prevAccounts => {
            return prevAccounts.map(acc => {
                const accTransactions = transactions.filter(t => t.account?.trim() === acc.name?.trim());
                const calculatedBalance = accTransactions.reduce((sum, t) => {
                    const amount = parseFloat(t.amount) || 0;
                    return t.type === 'income' ? sum + amount : sum - amount;
                }, 0);

                // Round to 2 decimals to avoid floating point drift
                const finalBalance = Number(calculatedBalance.toFixed(2));

                // If the account has an initial balance established at creation but NO transactions, 
                // we might be wiping it here. For safety, if balance is 0 and there are no transactions,
                // we check if we should keep the current balance or trust the 0.
                return { ...acc, balance: finalBalance };
            });
        });
    };

    const deleteAccount = async (id) => {
        setAccounts(accounts.filter(acc => acc.id !== id));
        try {
            if (supabase) await supabase.from('accounts').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const adjustAccountBalance = (accountId, newBalance, reason) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
            const diff = newBalance - account.balance;
            if (diff === 0) return;

            addTransaction({
                type: diff > 0 ? 'income' : 'expense',
                amount: Math.abs(diff),
                category: 'تسوية رصيد',
                account: account.name,
                notes: `تسوية يدوية: ${reason}`
            });
        }
    };

    const adjustCustomerBalance = (customerId, newBalance, reason) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            const diff = newBalance - (customer.balance || 0);
            if (diff === 0) return;

            addTransaction({
                type: diff > 0 ? 'income' : 'expense',
                amount: Math.abs(diff),
                category: 'تسوية رصيد عميل',
                account: customer.name,
                notes: `تسوية يدوية: ${reason}`
            });

            // Note: addTransaction will trigger the setCustomers update because of the logic inside it
        }
    };

    const resetAllAccounts = async () => {
        const confirmation = window.confirm('⚠️ هل أنت متأكد من تصفير جميع الحسابات؟\n\nسيتم تصفير أرصدة جميع الحسابات المالية إلى صفر.');
        if (!confirmation) return;

        // Reset all account balances to zero
        const resetAccounts = accounts.map(acc => ({ ...acc, balance: 0 }));
        setAccounts(resetAccounts);

        // Update Supabase
        try {
            if (supabase) {
                for (const acc of resetAccounts) {
                    await supabase.from('accounts').update({ balance: 0 }).eq('id', acc.id);
                }
            }
        } catch (e) {
            console.error('Error resetting accounts:', e);
        }

        alert('✅ تم تصفير جميع الحسابات بنجاح');
    };


    useEffect(() => {
        localStorage.setItem('kinz_employees', JSON.stringify(employees));
    }, [employees]);

    const addEmployee = async (employee) => {
        const id = Date.now().toString();
        const newEmp = { ...employee, id };
        setEmployees([...employees, newEmp]);
        try {
            if (supabase) await supabase.from('employees').insert(newEmp);
        } catch (e) { console.error(e); }
    };

    const updateEmployee = async (updatedEmployee) => {
        setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
        try {
            if (supabase) await supabase.from('employees').update(updatedEmployee).eq('id', updatedEmployee.id);
        } catch (e) { console.error(e); }
    };

    const deleteEmployee = async (id) => {
        setEmployees(employees.filter(e => e.id !== id));
        try {
            if (supabase) await supabase.from('employees').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const paySalary = (employeeId, amount, accountName) => {
        const emp = employees.find(e => e.id === employeeId);
        if (emp) {
            addTransaction({
                type: 'expense',
                amount: amount,
                category: 'رواتب',
                account: accountName,
                notes: `راتب شهر ${new Date().toLocaleDateString('ar-EG', { month: 'long' })} للموظف ${emp.name}`
            });
        }
    };

    useEffect(() => {
        localStorage.setItem('kinz_recurring', JSON.stringify(recurringExpenses));
    }, [recurringExpenses]);

    const addRecurring = async (expense) => {
        const id = Date.now().toString();
        const newExc = { ...expense, id };
        setRecurringExpenses([...recurringExpenses, newExc]);
        try {
            if (supabase) await supabase.from('recurring').insert(newExc);
        } catch (e) { console.error(e); }
    };

    const deleteRecurring = async (id) => {
        setRecurringExpenses(recurringExpenses.filter(e => e.id !== id));
        try {
            if (supabase) await supabase.from('recurring').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const processRecurring = (id) => {
        const exp = recurringExpenses.find(e => e.id === id);
        if (exp) {
            addTransaction({
                type: 'expense',
                amount: exp.amount,
                category: exp.category,
                account: exp.account,
                notes: `دفع دوري: ${exp.label}`
            });
        }
    };

    const addCustomer = async (customer) => {
        const id = Date.now().toString();
        const newCustomer = {
            id,
            name: customer.name || '',
            phone: customer.phone || '',
            address: customer.address || '',
            email: customer.email || '',
            balance: Number(customer.balance) || 0,
            projectType: customer.projectType || 'kitchen',
            projectCost: Number(customer.projectCost) || 0, // Added Project Cost (Budget)
            status: customer.status || 'design' // Default status
        };

        setCustomers(prev => [...prev, newCustomer]);

        try {
            if (supabase) {
                // Map to lowercase column names for Supabase
                const dbInfo = {
                    id: newCustomer.id,
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    address: newCustomer.address,
                    email: newCustomer.email,
                    balance: Number(newCustomer.balance) || 0,
                    projecttype: newCustomer.projectType,
                    projectcost: Number(newCustomer.projectCost) || 0,
                    status: newCustomer.status
                };
                const { error } = await supabase.from('customers').insert(dbInfo);
                if (error) console.error("❌ Supabase Save Error:", error.message);
                else console.log("✅ Customer saved to cloud");
            }
        } catch (e) { console.error("❌ Sync Error:", e); }
    };

    const updateCustomer = async (updatedCustomer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        try {
            if (supabase) {
                // Map to lowercase column names for Supabase
                const dbInfo = {
                    id: updatedCustomer.id,
                    name: updatedCustomer.name,
                    phone: updatedCustomer.phone,
                    address: updatedCustomer.address,
                    email: updatedCustomer.email,
                    balance: Number(updatedCustomer.balance) || 0,
                    projecttype: updatedCustomer.projectType,
                    projectcost: Number(updatedCustomer.projectCost) || 0,
                    status: updatedCustomer.status
                };
                await supabase.from('customers').update(dbInfo).eq('id', updatedCustomer.id);
            }
        } catch (e) { console.error(e); }
    };

    const deleteCustomer = async (id) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        try {
            if (supabase) await supabase.from('customers').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addInspection = async (inspection) => {
        const id = Date.now().toString();
        const newInsp = {
            ...inspection,
            id,
            date: new Date().toISOString(),
            status: inspection.status || 'planned',
            scheduledDate: inspection.scheduledDate || new Date().toISOString()
        };
        setInspections([newInsp, ...inspections]);
        try {
            if (supabase) await supabase.from('inspections').insert(newInsp);
        } catch (e) { console.error(e); }
    };

    const updateInspection = async (updated) => {
        setInspections(prev => prev.map(i => i.id === updated.id ? updated : i));
        try {
            if (supabase) await supabase.from('inspections').update(updated).eq('id', updated.id);
        } catch (e) { console.error(e); }
    };

    const deleteInspection = async (id) => {
        setInspections(prev => prev.filter(i => i.id !== id));
        try {
            if (supabase) await supabase.from('inspections').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addInvoice = async (invoice) => {
        const id = Date.now().toString();
        const year = new Date().getFullYear();
        const typePrefix = {
            inspection: 'INS',
            contract: 'CON',
            material: 'MAT',
            payment: 'PAY'
        }[invoice.type] || 'INV';

        const typeInvoices = invoices.filter(inv => inv.type === invoice.type);
        const nextNum = (typeInvoices.length + 1).toString().padStart(3, '0');
        const invoiceNumber = `${typePrefix}-${year}-${nextNum}`;

        const newInvoice = {
            ...invoice,
            id,
            number: invoiceNumber,
            date: invoice.date || new Date().toISOString(),
            status: invoice.status || 'draft'
        };

        setInvoices([newInvoice, ...invoices]);
        try {
            if (supabase) await supabase.from('invoices').insert(newInvoice);
        } catch (e) { console.error(e); }
    };

    const updateInvoice = async (updated) => {
        setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
        try {
            if (supabase) await supabase.from('invoices').update(updated).eq('id', updated.id);
        } catch (e) { console.error(e); }
    };

    const deleteInvoice = async (id) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        try {
            if (supabase) await supabase.from('invoices').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const updateInvoiceStatus = async (id, status) => {
        const invoice = invoices.find(inv => inv.id === id);
        if (invoice) {
            const updated = { ...invoice, status };
            updateInvoice(updated);
        }
    };

    const addBulkPurchase = async (bulkData) => {
        // bulkData can have:
        // Option 1: { account, supplier, totalAmount } - Simple mode
        // Option 2: { account, supplier, items: [...] } - Detailed mode
        const { account, supplier, items, totalAmount: providedTotal } = bulkData;

        // Calculate total from items or use provided total
        const totalAmount = providedTotal || (items ? items.reduce((sum, item) =>
            sum + (Number(item.quantity) * Number(item.unitPrice)), 0) : 0);

        // 1. Process items for inventory (if items provided)
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.materialName && item.quantity) {
                    await addPurchase({
                        materialName: item.materialName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice || 0,
                        unit: item.unit,
                        supplier: supplier,
                        account: null,
                        skipFinancials: true
                    });
                }
            }
        }

        // 2. Financial Logic - Single transaction
        // Deduct from paying account (if distinct account) or just record expense for Customer
        if (account) {
            addTransaction({
                type: 'expense',
                amount: totalAmount,
                category: 'مشتريات خامات',
                account: account,
                notes: `شراء مواد من مورد: ${supplier || 'غير محدد'}`
            });
        }
    };

    const addPurchase = async (purchase) => {
        const id = Date.now().toString();
        const totalPrice = purchase.total || (Number(purchase.quantity) * Number(purchase.unitPrice));
        const newPurchase = {
            ...purchase,
            id,
            total: totalPrice,
            date: new Date().toISOString(),
            serialNumber: purchase.serialNumber || `PO-${Date.now()}` // Grouping key
        };

        setPurchases(prev => [newPurchase, ...prev]);
        try {
            if (supabase) await supabase.from('purchases').insert(newPurchase);
        } catch (e) { console.error(e); }

        // 1. Update/Add inventory stock and track LAST PRICE (Only if not skipped)
        if (!purchase.skipInventory) {
            setInventory(prev => {
                const itemIndex = prev.findIndex(item => item.name === purchase.materialName);
                if (itemIndex > -1) {
                    const updatedItem = {
                        ...prev[itemIndex],
                        stock: prev[itemIndex].stock + Number(purchase.quantity),
                        lastPrice: Number(purchase.unitPrice)
                    };
                    updateInventoryItem(updatedItem);
                    addInventoryMovement({ itemId: updatedItem.id, itemName: updatedItem.name, type: 'IN', quantity: Number(purchase.quantity), reason: `شراء من مورد: ${purchase.supplier || 'غير معروف'}`, date: new Date().toISOString() });
                    const next = [...prev];
                    next[itemIndex] = updatedItem;
                    return next;
                } else {
                    const newItemId = Date.now().toString() + "-auto";
                    const newItem = { id: newItemId, name: purchase.materialName, unit: purchase.unit || 'متر مربع', stock: Number(purchase.quantity), category: 'خامات', minStock: 5, lastPrice: Number(purchase.unitPrice) };
                    addInventoryItem(newItem);
                    return [...prev, newItem];
                }
            });
        }

        // 2. Financial Logic (only if not skipFinancials)
        if (!purchase.skipFinancials) {
            // Check if purchase is linked to a customer directly (via account or customerName)
            const accountToCharge = purchase.customerName || purchase.account; // Prioritize customer name if purchase is for a customer

            if (accountToCharge) {
                addTransaction({
                    type: 'expense',
                    amount: totalPrice,
                    category: 'مشتريات خامات',
                    account: accountToCharge,
                    notes: `شراء ${purchase.materialName}`
                });
            }
        }
    };

    const consumeMaterial = async (consumption) => {
        // consumption: { itemName, quantity, notes }
        const item = inventory.find(i => i.name === consumption.itemName);
        if (!item) return;

        const quantity = Number(consumption.quantity);
        const unitPrice = item.lastPrice || 0; // Use last purchase price for deduction
        const totalValue = quantity * unitPrice;

        // 1. Reduce Stock
        const updatedItem = { ...item, stock: Math.max(0, item.stock - quantity) };
        updateInventoryItem(updatedItem);

        // 2. Record Movement
        addInventoryMovement({
            itemId: item.id,
            itemName: item.name,
            type: 'OUT',
            quantity: quantity,
            reason: consumption.notes || 'سحب تشغيل',
            date: new Date().toISOString()
        });

        // 3. No longer deducting from Workshop Account as it's removed. 
        // Logic for charging customer for consumption should be handled via explicit 'Expense' transaction if needed.
        // For now, consumption just reduces stock.
    };

    const updatePurchase = async (updatedPurchase) => {
        const oldPurchase = purchases.find(p => p.id === updatedPurchase.id);
        if (!oldPurchase) return;

        // 1. Reverse old inventory impact
        setInventory(prev => prev.map(item => {
            if (item.name === oldPurchase.materialName) {
                const newStock = Math.max(0, item.stock - Number(oldPurchase.quantity));
                updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                return { ...item, stock: newStock };
            }
            return item;
        }));

        // 2. Apply new inventory impact
        setInventory(prev => prev.map(item => {
            if (item.name === updatedPurchase.materialName) {
                const newStock = item.stock + Number(updatedPurchase.quantity);
                updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                return { ...item, stock: newStock };
            }
            return item;
        }));

        // 3. Update transactions
        // Find existing transaction for this purchase
        const oldNote = `شراء ${oldPurchase.materialName}`;
        // We look for transaction linked to either the old account or old customer name
        const accountTx = transactions.find(t => t.notes === oldNote && (t.account === oldPurchase.account || t.account === oldPurchase.customerName));

        if (accountTx) {
            updateTransaction({
                ...accountTx,
                amount: updatedPurchase.total || (Number(updatedPurchase.quantity) * Number(updatedPurchase.unitPrice)),
                account: updatedPurchase.customerName || updatedPurchase.account, // Update account if customer changed
                notes: `شراء ${updatedPurchase.materialName}`
            });
        }

        setPurchases(purchases.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
        try {
            if (supabase) await supabase.from('purchases').update(updatedPurchase).eq('id', updatedPurchase.id);
        } catch (e) { console.error(e); }
    };

    const deletePurchase = async (id) => {
        const purchase = purchases.find(p => p.id === id);
        if (purchase) {
            // Reverse inventory stock
            setInventory(prev => prev.map(item => {
                if (item.name === purchase.materialName) {
                    const newStock = Math.max(0, item.stock - Number(purchase.quantity));
                    updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                    return { ...item, stock: newStock };
                }
                return item;
            }));

            // Find and delete associated transactions
            const transactionNote = `شراء ${purchase.materialName}`;
            const accountTx = transactions.find(t => t.notes === transactionNote && (t.account === purchase.account || t.account === purchase.customerName));
            if (accountTx) deleteTransaction(accountTx.id);

            try {
                if (supabase) await supabase.from('purchases').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
        setPurchases(purchases.filter(p => p.id !== id));
    };

    const addInventoryMovement = async (movement) => {
        const id = Date.now().toString();
        const newMovement = {
            ...movement,
            id,
            date: movement.date || new Date().toISOString()
        };
        setInventoryMovements(prev => [newMovement, ...prev]);
        try {
            if (supabase) await supabase.from('inventory_movements').insert(newMovement);
        } catch (e) { console.error(e); }
    };

    const addInventoryItem = async (item) => {
        const id = Date.now().toString();
        const newItem = { ...item, id, stock: Number(item.stock) || 0 };
        setInventory([...inventory, newItem]);
        try {
            if (supabase) await supabase.from('inventory').insert(newItem);
        } catch (e) { console.error(e); }

        // Start movement
        addInventoryMovement({
            itemId: id,
            itemName: item.name,
            type: 'ADJUST',
            quantity: Number(item.stock),
            reason: 'رصيد افتتاحي',
            date: new Date().toISOString()
        });
    };

    const updateInventoryItem = async (updatedItem) => {
        setInventory(inventory.map(item => item.id === updatedItem.id ? updatedItem : item));
        try {
            if (supabase) await supabase.from('inventory').update(updatedItem).eq('id', updatedItem.id);
        } catch (e) { console.error(e); }
    };

    const deleteInventoryItem = async (id) => {
        setInventory(inventory.filter(item => item.id !== id));
        try {
            if (supabase) await supabase.from('inventory').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };


    const addUser = async (user) => {
        const id = Date.now().toString();
        const newUser = { ...user, id, status: 'active' };
        setUsers([...users, newUser]);
        try {
            if (supabase) await supabase.from('users').insert(newUser);
        } catch (e) { console.error(e); }
    };

    const updateUser = async (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        try {
            if (supabase) await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
        } catch (e) { console.error(e); }
        // If updating current user, update currentUser state too
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };

    const deleteUser = async (id) => {
        setUsers(users.filter(u => u.id !== id));
        try {
            if (supabase) await supabase.from('users').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const updateSettings = async (newSettings) => {
        const updated = { ...systemSettings, ...newSettings };
        setSystemSettings(updated);
        try {
            if (supabase) await supabase.from('settings').update(updated).eq('id', 'global');
        } catch (e) { console.error(e); }
    };

    const updateContractOptions = async (newOptions) => {
        setContractOptions(newOptions);
        try {
            if (supabase) await supabase.from('contract_options').upsert({ id: 'global', ...newOptions });
        } catch (e) { console.error(e); }
    };

    // Migration: Ensure all admins have new permissions when they are added to the system
    useEffect(() => {
        setUsers(prev => prev.map(u => {
            if (u.role === 'admin') {
                const updatedPerms = { ...adminPermissions, ...u.permissions };
                // Check if any permission is missing
                if (JSON.stringify(updatedPerms) !== JSON.stringify(u.permissions)) {
                    return { ...u, permissions: updatedPerms };
                }
            }
            return u;
        }));
    }, []);

    const login = (username, password) => {
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const factoryReset = async () => {
        if (!window.confirm('⚠️ تحذير نهائي: سيتم مسح كافة البيانات من السحابة ومن هذا الجهاز نهائياً. لا يمكن التراجع!\nهل أنت متأكد؟')) return;

        const tables = [
            'customers', 'purchases', 'inventory', 'inventory_movements',
            'inspections', 'invoices', 'users', 'settings',
            'transactions', 'accounts', 'employees', 'recurring', 'contract_options'
        ];

        try {
            // 1. Clear Supabase
            if (supabase) {
                for (const table of tables) {
                    await supabase.from(table).delete().neq('id', '0'); // Delete all rows
                }
            }

            // 2. Clear LocalStorage
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('kinz_')) localStorage.removeItem(key);
            });

            // 3. Reload App
            window.location.reload();
        } catch (e) {
            console.error("Factory reset failed:", e);
            alert("حدث خطأ أثناء مسح البيانات.");
        }
    };

    return (
        <AppContext.Provider value={{
            customers,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            purchases,
            addPurchase,
            addBulkPurchase,
            inventory,
            inventoryMovements,
            addInventoryMovement,
            inspections,
            addInspection,
            updateInspection,
            deleteInspection,
            invoices,
            addInvoice,
            updateInvoice,
            deleteInvoice,
            updateInvoiceStatus,
            users,
            addUser,
            updateUser,
            deleteUser,
            systemSettings,
            updateSettings,
            contractOptions,
            updateContractOptions,
            currentUser,
            login,
            logout,
            defaultPermissions,
            transactions,
            accounts,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addAccount,
            updateAccount,
            deleteAccount,
            adjustAccountBalance,
            recalculateAccountBalances,
            resetAllAccounts,
            adjustCustomerBalance,
            employees,
            addEmployee,
            serviceItems, // Added
            setServiceItems, // Added
            updateEmployee,
            deleteEmployee,
            paySalary,
            recurringExpenses,
            addRecurring,
            deleteRecurring,
            processRecurring,
            updatePurchase,
            deletePurchase,
            addInventoryItem,
            updateInventoryItem,
            deleteInventoryItem,
            consumeMaterial,
            factoryReset,
            darkMode,
            toggleDarkMode: () => setDarkMode(!darkMode)
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
