import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [city, setcity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city) {
            onSearch(city);
            setcity('');
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <span className="search-icon">🔍</span>
            <input
                className="search-input"
                type="text"
                value={city}
                onChange={(e) => setcity(e.target.value)}
                placeholder="maryland"
                required
            />
        </form>
    );
}

export default SearchBar;