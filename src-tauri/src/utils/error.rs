use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppError {
    pub message: String,
}

impl<T: std::fmt::Display> From<T> for AppError {
    fn from(err: T) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;