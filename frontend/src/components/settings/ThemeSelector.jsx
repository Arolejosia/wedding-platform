import { themes } from "../../config/themes";

const ThemeSelector = ({ wedding, setWedding }) => {

  const changeTheme = async (themeId) => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/weddings/${wedding._id}/theme`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ themeId })
        }
      );

      const data = await res.json();

      if (data.success) {
        setWedding(data.wedding);
      }

    } catch (err) {
      console.error("Erreur changement thème", err);
    }

  };

  return (

    <div className="themes-grid">

      {themes.map(theme => (

        <div
          key={theme.id}
          className={`theme-card ${wedding.settings.theme.id === theme.id ? "active" : ""}`}
          onClick={() => changeTheme(theme.id)}
        >

          <h3>{theme.name}</h3>

          <div
            className="theme-preview"
            style={{ background: theme.primary }}
          />

        </div>

      ))}

    </div>

  );

};

export default ThemeSelector;