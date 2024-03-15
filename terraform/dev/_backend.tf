terraform {
  backend "gcs" {
    bucket = "cwb07-fe98-tfstate"
    prefix = "identity-functions/dev"
  }
}
