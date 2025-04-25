from services.errors.base import BaseServiceError


class AppMemberNotFoundError(BaseServiceError):
    """Raised when a user is not a member of the app."""

    pass


class AppMemberAlreadyExistsError(BaseServiceError):
    """Raised when a user is already a member of the app."""

    pass
