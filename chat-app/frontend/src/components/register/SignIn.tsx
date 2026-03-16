import {TOKEN} from "../../config/Config";
import {useDispatch, useSelector} from "react-redux";
import {LoginRequestDTO} from "../../redux/auth/AuthModel";
import {useNavigate} from "react-router-dom";
import React, {Dispatch, useEffect, useState} from "react";
import {currentUser, loginUser, clearAuthError} from "../../redux/auth/AuthAction";
import {RootState} from "../../redux/Store";
import {
    Button,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import {Visibility, VisibilityOff, Person, Lock} from "@mui/icons-material";
import styles from "./Register.module.scss";

const SignIn = () => {
    const [signInData, setSignInData] = useState<LoginRequestDTO>({username: "", password: ""});
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const token: string | null = localStorage.getItem(TOKEN);
    const {reqUser, loading, error} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(currentUser(token));
        }
    }, [token, dispatch]);

    useEffect(() => {
        if (reqUser) {
            navigate("/");
        }
    }, [reqUser, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]);

    const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedUsername = signInData.username.trim();
        if (!trimmedUsername || !signInData.password) {
            return;
        }
        dispatch(loginUser({...signInData, username: trimmedUsername}));
    };

    const onChangeUsername = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSignInData({...signInData, username: e.target.value});
        if (error) dispatch(clearAuthError());
    };

    const onChangePassword = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSignInData({...signInData, password: e.target.value});
        if (error) dispatch(clearAuthError());
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const isFormValid = signInData.username.trim() !== "" && signInData.password !== "";
    const isButtonDisabled = !isFormValid || loading;

    return (
        <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.logo}>
                    <h1 className={styles.logoText}>
                        M<span className={styles.logoAccent}>Chat</span>
                    </h1>
                    <p className={styles.subtitle}>Корпоративный мессенджер</p>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className={styles.inputGroup}>
                        <p className={styles.text}>Логин</p>
                        <TextField
                            className={styles.textInput}
                            id="username"
                            type="text"
                            placeholder="r_koledin"
                            helperText="Введите ваш username"
                            variant="outlined"
                            onChange={onChangeUsername}
                            value={signInData.username}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: '#999' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <p className={styles.text}>Пароль</p>
                        <TextField
                            className={styles.textInput}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Введите пароль"
                            variant="outlined"
                            onChange={onChangePassword}
                            value={signInData.password}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#999' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            size="small"
                                            disabled={loading}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>

                    <div className={styles.forgotPassword}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setForgotPasswordOpen(true)}
                            sx={{
                                color: '#666',
                                textTransform: 'none',
                                fontSize: '13px',
                                padding: '4px 8px',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    color: '#18191C',
                                },
                            }}
                        >
                            Забыли пароль?
                        </Button>
                    </div>

                    <div className={styles.button}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={isButtonDisabled}
                            sx={{
                                backgroundColor: '#FFD700',
                                color: '#18191C',
                                fontWeight: 600,
                                fontSize: '16px',
                                textTransform: 'none',
                                borderRadius: '10px',
                                padding: '14px 24px',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#E6C200',
                                    boxShadow: '0 8px 20px rgba(255, 215, 0, 0.35)',
                                },
                                '&:disabled': {
                                    backgroundColor: '#E0E0E0',
                                    color: '#999',
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#18191C' }} />
                            ) : (
                                'Войти'
                            )}
                        </Button>
                    </div>
                </form>

            </div>

            <Dialog
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '8px',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Восстановление пароля
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Для восстановления пароля обратитесь к системному администратору ОПО.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setForgotPasswordOpen(false)}
                        sx={{
                            color: '#18191C',
                            fontWeight: 600,
                            textTransform: 'none',
                        }}
                    >
                        Понятно
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SignIn;
