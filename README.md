# Mobility Data Specification

The Mobility Data Specification (**MDS**), a project of the [Open Mobility Foundation](http://www.openmobilityfoundation.org) (OMF), is a set of Application Programming Interfaces (APIs) focused on dockless e-scooters, bicycles, mopeds and carshare. Inspired by projects like [GTFS](https://developers.google.com/transit/gtfs/reference/) and [GBFS](https://github.com/NABSA/gbfs), the goals of MDS are to provide a standardized way for municipalities or other regulatory agencies to ingest, compare and analyze data from mobility service providers, and to give municipalities the ability to express regulation in machine-readable formats.

[Read more about the Mobility Data Specification](https://github.com/openmobilityfoundation/mds-core/blob/master/README.md)

# mds-compliance-mobile Project Overview

This app helps your agency verify that the data provided to MDS by mobility service providers actually matches what's happening on the street.

Currently this takes two forms:

1. Monitoring Vehicle Compliance as Reported by Providers

   * Verifying that vehicles registered with MDS are actually present on the street.
   * Reporting vehicles which are present on the street but not in MDS.
   * Noting broken, mis-parked, etc. vehicles.

1. Auditing Vehicle Trips

   * This involves taking a trip on a provider vehicle (scooter or bike) and simultaneously using the Compliance Mobile app to create a matching "audit trip". You can then compare the audit trip with the provider trip data submitted to MDS to:
   * Ensure that the provider is reporting `trip_start`, `trip_end`, etc events accurately and in a timely manner.
   * Verify that telemetry for the trip is being reported accurately and that it roughly matches telemetry recorded during the audit.

# Learn More / Get Involved / Contributing

To stay up to date on MDS releases, meetings, and events, please **subscribe to the [mds-announce](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-announce) mailing list.**

mds-core is an open source project with all development taking place on GitHub. Comments and ideas can be shared by [creating an issue](https://github.com/openmobilityfoundation/mds-core/issues), and specific changes can be suggested by [opening a pull request](https://github.com/openmobilityfoundation/mds-core/pulls). Before contributing, please review our [CONTRIBUTING page](CONTRIBUTING.md) to understand guidelines and policies for participation and our [CODE OF CONDUCT page](CODE_OF_CONDUCT.md).

You can also get involved in development by joining an OMF working group. The working groups maintain the OMF GitHub repositories and work through issues and pull requests. Each working group has its own mailing list for non-technical discussion and planning:

| Working Group | Mailing List | Description
| ------------- | ------------ | --------
| City Services | [mds-city-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-city-services) | Manages the [`mds-core`](https://github.com/openmobilityfoundation/mds-core) reference implementation, as well as the [`agency`][agency] and [`policy`][policy] APIs within MDS.
| Provider Services | [mds-provider-services](https://groups.google.com/a/groups.openmobilityfoundation.org/forum/#!forum/mds-provider-services) | Manages the [`provider`][provider] API within MDS.

You can view info about past releases and planning calls in the [wiki](https://github.com/openmobilityfoundation/mobility-data-specification/wiki).

For questions about MDS please contact [info@openmobilityfoundation.org](mailto:info@openmobilityfoundation.org). Media inquiries to [media@openmobilityfoundation.org](mailto:media@openmobilityfoundation.org)

[agency]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/agency/README.md
[provider]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/provider/README.md
[policy]: https://github.com/openmobilityfoundation/mobility-data-specification/tree/master/policy/README.md
