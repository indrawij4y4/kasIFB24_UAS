try {
    const icons = require('lucide-react');
    console.log('Available icons count:', Object.keys(icons).length);
    console.log('User:', !!icons.User);
    console.log('Key:', !!icons.Key);
    console.log('CreditCard:', !!icons.CreditCard);
    console.log('Settings:', !!icons.Settings);
    console.log('Database:', !!icons.Database);
    console.log('ChevronRight:', !!icons.ChevronRight);
} catch (e) {
    console.error(e);
}
