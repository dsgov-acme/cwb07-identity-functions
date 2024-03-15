terraform {
  backend "gcs" {
    bucket = "cwb07-tfstate"
    prefix = "identity-functions/prod"
  }
}
