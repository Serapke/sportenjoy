import { Component, OnInit, OnDestroy } from '@angular/core';
import { ROUTER_DIRECTIVES, Router, ActivatedRoute } from '@angular/router';
import { ISpot } from '../spot';
import { SpotService } from '../spot.service';
import { FileService } from '../../shared/file.service';
import { LocationService } from '../../shared/location/location.service';

@Component({
	selector: 'ng-topPlaces',
	templateUrl: '../form.html',
	styleUrls: ['../form.css'],
	directives: [ROUTER_DIRECTIVES]
})
export class SpotUpdateComponent implements OnInit, OnDestroy {
	private sub: any;
	spot: ISpot;
	oldSpot: ISpot;
	errorMessage: string;
	submitted: boolean = false;
	image: string;
	file: string = "";

	constructor(
		private _spotService: SpotService,
		private _route: ActivatedRoute,
		private _fileService: FileService,
		private _locationService: LocationService,
		private _router: Router) {}

	ngOnInit(): void {
		if (!this.spot) {
			this.sub = this._route.params.subscribe(params => {
				let id = +params['id'];
				this.getSpot(id);
			});
    	}
  	}

	onSubmit() {
		alert(this.spot.latitude + " " + this.spot.longitude + " (types: " + (typeof this.spot.latitude) + ", " + (typeof this.spot.longitude) + ")")

		this._locationService.geocode(this.spot.latitude, this.spot.longitude).
			subscribe(position => {
				console.log("Update");
				console.log(this.findAddressPart(position, "route", "short"));
				this.spot.city = this.findAddressPart(position, "locality", "long");
				console.log(position[0].address_components[2].long_name);
				this.spot.country = this.findAddressPart(position, "country", "long");
				console.log(position[0].address_components[5].long_name);
				console.log(this.spot);
				this._spotService.updateSpot(this.spot)
					.subscribe(
						spot => {
							this.spot = spot;
							this.submitted = true;
						},
						error => this.errorMessage = <any>error
					);
				console.log("Done");
			});
	}

	findAddressPart(position: any, part: string, version: string): string {
		let address = position[0].address_components;
		for (var item of address) {
			if (item.types.indexOf(part) != -1)  {
				if (version == "long") {
					return item.long_name;
				}
				else {
					return item.short_name;
				}
			}
				
		}
		return "";
	}

	changeListener($event) : void {
		this.file = $event.target.files[0].name;
    this._fileService.read($event.target, this.spot).subscribe(
			data => { this.image = data; }
		);
  }

	getSpot(id: number) {
		this._spotService.getSpot(id)
			.subscribe(
				spot => {
					this.spot = spot;
					this.oldSpot = spot;
					this.image = this.spot.images.url;
				},
				error => this.errorMessage = <any>error
			);
	}

	ngOnDestroy() {
	  this.sub.unsubscribe();
	}

	isAdding(): boolean {
		return false;
	}
	isUpdating(): boolean {
		return true;
	}

}
