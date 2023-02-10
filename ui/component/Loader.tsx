import style from "./loader.module.css";

const Loader = () => {
  return (
    <div className={style.loading}>
      <div className={style.loadingindiv}></div>
    </div>
  );
};

export default Loader;
